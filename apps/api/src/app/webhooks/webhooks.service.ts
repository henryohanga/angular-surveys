import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Webhook, WebhookEvent } from './entities/webhook.entity';
import { WebhookLog } from './entities/webhook-log.entity';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';
import { Survey } from '../surveys/entities/survey.entity';
import { SurveyResponse } from '../responses/entities/response.entity';
import * as crypto from 'crypto';

interface WebhookPayload {
  deliveryId: string;
  event: WebhookEvent;
  timestamp: string;
  survey: {
    id: string;
    name: string;
    status: string;
  };
  response?: {
    id: string;
    submittedAt: string;
    completedAt?: string;
    isComplete: boolean;
    answers: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  };
  questionMappings?: {
    questionId: string;
    externalId: string;
    fieldName?: string;
  }[];
}

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAYS = [60000, 300000, 900000]; // 1min, 5min, 15min

  constructor(
    @InjectRepository(Webhook)
    private readonly webhooksRepository: Repository<Webhook>,
    @InjectRepository(WebhookLog)
    private readonly logsRepository: Repository<WebhookLog>,
    @InjectRepository(Survey)
    private readonly surveysRepository: Repository<Survey>
  ) {}

  async create(
    surveyId: string,
    createWebhookDto: CreateWebhookDto
  ): Promise<Webhook> {
    // Verify survey exists
    const survey = await this.surveysRepository.findOne({
      where: { id: surveyId },
    });
    if (!survey) {
      throw new NotFoundException('Survey not found');
    }

    const secret = this.generateSecret();

    const webhook = this.webhooksRepository.create({
      ...createWebhookDto,
      surveyId,
      events: createWebhookDto.events as WebhookEvent[],
      secret,
      includeMetadata: createWebhookDto.includeMetadata ?? true,
      useQuestionMappings: createWebhookDto.useQuestionMappings ?? false,
      maxRetries: this.MAX_RETRIES,
    });

    return this.webhooksRepository.save(webhook);
  }

  async findAllBySurvey(surveyId: string): Promise<Webhook[]> {
    return this.webhooksRepository.find({
      where: { surveyId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Webhook> {
    const webhook = await this.webhooksRepository.findOne({ where: { id } });
    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }
    return webhook;
  }

  async update(
    id: string,
    updateWebhookDto: UpdateWebhookDto
  ): Promise<Webhook> {
    const webhook = await this.findOne(id);
    Object.assign(webhook, updateWebhookDto);
    return this.webhooksRepository.save(webhook);
  }

  async remove(id: string): Promise<void> {
    const result = await this.webhooksRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Webhook not found');
    }
  }

  async regenerateSecret(id: string): Promise<Webhook> {
    const webhook = await this.findOne(id);
    webhook.secret = this.generateSecret();
    return this.webhooksRepository.save(webhook);
  }

  async getLogs(
    webhookId: string,
    limit = 50,
    offset = 0
  ): Promise<{ logs: WebhookLog[]; total: number }> {
    const [logs, total] = await this.logsRepository.findAndCount({
      where: { webhookId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
    return { logs, total };
  }

  async getLogsBySurvey(
    surveyId: string,
    limit = 50,
    offset = 0
  ): Promise<{ logs: WebhookLog[]; total: number }> {
    const [logs, total] = await this.logsRepository.findAndCount({
      where: { surveyId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
      relations: ['webhook'],
    });
    return { logs, total };
  }

  async getDeliveryStatus(webhookId: string) {
    const webhook = await this.findOne(webhookId);

    const [total, successful, failed, pending] = await Promise.all([
      this.logsRepository.count({ where: { webhookId } }),
      this.logsRepository.count({ where: { webhookId, success: true } }),
      this.logsRepository.count({
        where: { webhookId, success: false, canRetry: false },
      }),
      this.logsRepository.count({
        where: { webhookId, success: false, canRetry: true },
      }),
    ]);

    const lastDelivery = await this.logsRepository.findOne({
      where: { webhookId },
      order: { createdAt: 'DESC' },
    });

    const lastSuccess = await this.logsRepository.findOne({
      where: { webhookId, success: true },
      order: { createdAt: 'DESC' },
    });

    const lastFailure = await this.logsRepository.findOne({
      where: { webhookId, success: false },
      order: { createdAt: 'DESC' },
    });

    return {
      webhookId: webhook.id,
      totalDeliveries: total,
      successfulDeliveries: successful,
      failedDeliveries: failed,
      pendingRetries: pending,
      lastDeliveryAt: lastDelivery?.createdAt,
      lastSuccessAt: lastSuccess?.createdAt,
      lastFailureAt: lastFailure?.createdAt,
      successRate: total > 0 ? (successful / total) * 100 : 0,
    };
  }

  /**
   * Trigger webhooks for a specific event
   */
  async triggerWebhooks(
    surveyId: string,
    event: WebhookEvent,
    response?: SurveyResponse
  ): Promise<void> {
    const webhooks = await this.webhooksRepository.find({
      where: { surveyId, isActive: true },
    });

    const survey = await this.surveysRepository.findOne({
      where: { id: surveyId },
    });

    if (!survey) {
      this.logger.warn(`Survey ${surveyId} not found for webhook trigger`);
      return;
    }

    const relevantWebhooks = webhooks.filter((w) => w.events.includes(event));

    for (const webhook of relevantWebhooks) {
      // Execute webhook asynchronously
      this.executeWebhook(webhook, survey, event, response).catch((err) => {
        this.logger.error(
          `Failed to execute webhook ${webhook.id}: ${err.message}`
        );
      });
    }
  }

  /**
   * Manually trigger a webhook for a specific response
   */
  async triggerManual(
    webhookId: string,
    responseId: string
  ): Promise<WebhookLog> {
    const webhook = await this.findOne(webhookId);

    const survey = await this.surveysRepository.findOne({
      where: { id: webhook.surveyId },
    });

    if (!survey) {
      throw new NotFoundException('Survey not found');
    }

    // We need to get the response - import ResponsesService would create circular dep
    // So we'll query directly here
    const response = await this.logsRepository.manager
      .getRepository(SurveyResponse)
      .findOne({ where: { id: responseId } });

    if (!response) {
      throw new NotFoundException('Response not found');
    }

    if (response.surveyId !== webhook.surveyId) {
      throw new BadRequestException(
        "Response does not belong to this webhook's survey"
      );
    }

    return this.executeWebhook(webhook, survey, 'response.submitted', response);
  }

  /**
   * Retry a failed webhook delivery
   */
  async retryDelivery(logId: string): Promise<WebhookLog> {
    const log = await this.logsRepository.findOne({
      where: { id: logId },
      relations: ['webhook'],
    });

    if (!log) {
      throw new NotFoundException('Webhook log not found');
    }

    if (log.success) {
      throw new BadRequestException('Cannot retry a successful delivery');
    }

    const webhook = log.webhook;
    const survey = await this.surveysRepository.findOne({
      where: { id: log.surveyId },
    });

    if (!survey) {
      throw new NotFoundException('Survey not found');
    }

    let response: SurveyResponse | null = null;
    if (log.responseId) {
      response = await this.logsRepository.manager
        .getRepository(SurveyResponse)
        .findOne({ where: { id: log.responseId } });
    }

    return this.executeWebhook(
      webhook,
      survey,
      log.event,
      response ?? undefined,
      log.attempt + 1
    );
  }

  /**
   * Process pending retries (to be called by a scheduler)
   */
  async processPendingRetries(): Promise<void> {
    const now = new Date();
    const pendingLogs = await this.logsRepository.find({
      where: {
        canRetry: true,
        success: false,
        nextRetryAt: LessThanOrEqual(now),
      },
      relations: ['webhook'],
      take: 100,
    });

    for (const log of pendingLogs) {
      try {
        await this.retryDelivery(log.id);
      } catch (err) {
        this.logger.error(
          `Failed to retry delivery ${log.id}: ${(err as Error).message}`
        );
      }
    }
  }

  /**
   * Test a webhook URL with sample payload
   */
  async testWebhook(webhookId: string): Promise<{
    success: boolean;
    statusCode?: number;
    responseTime?: number;
    error?: string;
    responseBody?: string;
  }> {
    const webhook = await this.findOne(webhookId);
    const survey = await this.surveysRepository.findOne({
      where: { id: webhook.surveyId },
    });

    if (!survey) {
      throw new NotFoundException('Survey not found');
    }

    const payload: WebhookPayload = {
      deliveryId: `test-${Date.now()}`,
      event: 'response.submitted',
      timestamp: new Date().toISOString(),
      survey: {
        id: survey.id,
        name: survey.name,
        status: survey.status,
      },
      response: {
        id: 'test-response-id',
        submittedAt: new Date().toISOString(),
        isComplete: true,
        answers: { 'sample-question-id': 'Sample answer' },
        metadata: webhook.includeMetadata
          ? { deviceType: 'desktop', browser: 'Chrome' }
          : undefined,
      },
    };

    const signature = this.generateSignature(
      JSON.stringify(payload),
      webhook.secret
    );
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': signature,
      'X-Webhook-Event': 'response.submitted',
      'X-Webhook-Delivery': payload.deliveryId,
      ...(webhook.headers || {}),
    };

    const startTime = Date.now();

    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(30000),
      });

      const responseTime = Date.now() - startTime;
      const responseBody = await response.text();

      return {
        success: response.ok,
        statusCode: response.status,
        responseTime,
        responseBody: responseBody.substring(0, 1000),
        error: response.ok ? undefined : `HTTP ${response.status}`,
      };
    } catch (err) {
      return {
        success: false,
        responseTime: Date.now() - startTime,
        error: (err as Error).message,
      };
    }
  }

  private async executeWebhook(
    webhook: Webhook,
    survey: Survey,
    event: WebhookEvent,
    response?: SurveyResponse,
    attempt = 1
  ): Promise<WebhookLog> {
    const deliveryId = crypto.randomUUID();

    // Build payload
    const payload = this.buildPayload(
      webhook,
      survey,
      event,
      response,
      deliveryId
    );
    const payloadString = JSON.stringify(payload);

    // Generate signature
    const signature = this.generateSignature(payloadString, webhook.secret);

    // Build headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': signature,
      'X-Webhook-Event': event,
      'X-Webhook-Delivery': deliveryId,
      'User-Agent': 'Angular-Surveys-Webhook/1.0',
      ...(webhook.headers || {}),
    };

    const startTime = Date.now();
    let statusCode: number | undefined;
    let responseBody: string | undefined;
    let responseHeaders: Record<string, string> | undefined;
    let success = false;
    let error: string | undefined;

    try {
      const fetchResponse = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body: payloadString,
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      statusCode = fetchResponse.status;
      responseBody = await fetchResponse.text();
      responseHeaders = {};
      fetchResponse.headers.forEach((value, key) => {
        responseHeaders![key] = value;
      });
      success = fetchResponse.ok;

      if (!success) {
        error = `HTTP ${statusCode}: ${responseBody?.substring(0, 200)}`;
      }
    } catch (err) {
      error = (err as Error).message;
      this.logger.error(`Webhook delivery failed for ${webhook.id}: ${error}`);
    }

    const duration = Date.now() - startTime;
    const canRetry = !success && attempt < webhook.maxRetries;
    const nextRetryAt = canRetry
      ? new Date(Date.now() + this.RETRY_DELAYS[attempt - 1])
      : undefined;

    // Create log entry
    const log = this.logsRepository.create({
      webhookId: webhook.id,
      responseId: response?.id,
      surveyId: survey.id,
      event,
      url: webhook.url,
      method: 'POST',
      requestHeaders: headers,
      requestBody: payloadString,
      statusCode,
      responseBody: responseBody?.substring(0, 10000),
      responseHeaders,
      success,
      error,
      attempt,
      canRetry,
      duration,
      nextRetryAt,
    });

    const savedLog = await this.logsRepository.save(log);

    // Update webhook retry count
    if (!success) {
      webhook.retryCount = attempt;
      await this.webhooksRepository.save(webhook);
    } else {
      webhook.retryCount = 0;
      await this.webhooksRepository.save(webhook);
    }

    return savedLog;
  }

  private buildPayload(
    webhook: Webhook,
    survey: Survey,
    event: WebhookEvent,
    response: SurveyResponse | undefined,
    deliveryId: string
  ): WebhookPayload {
    const payload: WebhookPayload = {
      deliveryId,
      event,
      timestamp: new Date().toISOString(),
      survey: {
        id: survey.id,
        name: survey.name,
        status: survey.status,
      },
    };

    if (response) {
      let answers = response.responses as Record<string, unknown>;

      // Apply question mappings if enabled
      if (webhook.useQuestionMappings && survey.settings) {
        const developerSettings = (survey as unknown as Record<string, unknown>)
          .developerSettings as {
          questionMappings?: {
            questionId: string;
            externalId: string;
            fieldName?: string;
          }[];
        };

        if (developerSettings?.questionMappings) {
          answers = this.applyQuestionMappings(
            answers,
            developerSettings.questionMappings
          );
          payload.questionMappings = developerSettings.questionMappings;
        }
      }

      payload.response = {
        id: response.id,
        submittedAt: response.submittedAt.toISOString(),
        completedAt: response.completedAt?.toISOString(),
        isComplete: response.isComplete,
        answers,
        metadata: webhook.includeMetadata
          ? (response.metadata as Record<string, unknown>)
          : undefined,
      };
    }

    return payload;
  }

  private applyQuestionMappings(
    answers: Record<string, unknown>,
    mappings: {
      questionId: string;
      externalId: string;
      fieldName?: string;
    }[]
  ): Record<string, unknown> {
    const mappedAnswers: Record<string, unknown> = {};

    for (const [questionId, value] of Object.entries(answers)) {
      const mapping = mappings.find((m) => m.questionId === questionId);
      if (mapping) {
        const key = mapping.fieldName || mapping.externalId;
        mappedAnswers[key] = value;
      } else {
        mappedAnswers[questionId] = value;
      }
    }

    return mappedAnswers;
  }

  private generateSecret(): string {
    return `whsec_${crypto.randomBytes(32).toString('hex')}`;
  }

  private generateSignature(payload: string, secret: string): string {
    const timestamp = Math.floor(Date.now() / 1000);
    const signedPayload = `${timestamp}.${payload}`;
    const signature = crypto
      .createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex');
    return `t=${timestamp},v1=${signature}`;
  }
}
