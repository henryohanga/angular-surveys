import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Webhook {
  id: string;
  surveyId: string;
  url: string;
  name: string;
  description?: string;
  isActive: boolean;
  events: WebhookEvent[];
  headers?: Record<string, string>;
  includeMetadata: boolean;
  useQuestionMappings: boolean;
  secret: string;
  retryCount: number;
  maxRetries: number;
  createdAt: string;
  updatedAt: string;
}

export type WebhookEvent =
  | 'response.submitted'
  | 'response.updated'
  | 'response.deleted'
  | 'survey.published'
  | 'survey.unpublished';

export interface WebhookLog {
  id: string;
  webhookId: string;
  responseId?: string;
  surveyId: string;
  event: WebhookEvent;
  url: string;
  method: string;
  requestHeaders: Record<string, string>;
  requestBody: string;
  statusCode?: number;
  responseBody?: string;
  responseHeaders?: Record<string, string>;
  success: boolean;
  error?: string;
  attempt: number;
  canRetry: boolean;
  duration?: number;
  createdAt: string;
  nextRetryAt?: string;
  webhook?: Webhook;
}

export interface WebhookDeliveryStatus {
  webhookId: string;
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  pendingRetries: number;
  lastDeliveryAt?: string;
  lastSuccessAt?: string;
  lastFailureAt?: string;
  successRate: number;
}

export interface WebhookTestResult {
  success: boolean;
  statusCode?: number;
  responseTime?: number;
  error?: string;
  responseBody?: string;
}

export interface CreateWebhookDto {
  url: string;
  name: string;
  description?: string;
  events: WebhookEvent[];
  headers?: Record<string, string>;
  includeMetadata?: boolean;
  useQuestionMappings?: boolean;
}

export interface UpdateWebhookDto {
  url?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
  events?: WebhookEvent[];
  headers?: Record<string, string>;
  includeMetadata?: boolean;
  useQuestionMappings?: boolean;
}

export interface QuestionMapping {
  questionId: string;
  externalId: string;
  fieldName?: string;
  description?: string;
}

export interface DeveloperSettings {
  enabled: boolean;
  apiKey?: string;
  apiSecret?: string;
  questionMappings?: QuestionMapping[];
  customMetadataFields?: string[];
}

export interface UpdateDeveloperSettingsDto {
  enabled?: boolean;
  questionMappings?: QuestionMapping[];
  customMetadataFields?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class DeveloperApiService {
  constructor(private http: HttpClient) {}

  // ==================== WEBHOOKS ====================

  createWebhook(surveyId: string, data: CreateWebhookDto): Observable<Webhook> {
    return this.http.post<Webhook>(`/webhooks/survey/${surveyId}`, data);
  }

  getWebhooks(surveyId: string): Observable<Webhook[]> {
    return this.http.get<Webhook[]>(`/webhooks/survey/${surveyId}`);
  }

  getWebhook(id: string): Observable<Webhook> {
    return this.http.get<Webhook>(`/webhooks/${id}`);
  }

  updateWebhook(id: string, data: UpdateWebhookDto): Observable<Webhook> {
    return this.http.put<Webhook>(`/webhooks/${id}`, data);
  }

  deleteWebhook(id: string): Observable<void> {
    return this.http.delete<void>(`/webhooks/${id}`);
  }

  regenerateSecret(id: string): Observable<Webhook> {
    return this.http.post<Webhook>(`/webhooks/${id}/regenerate-secret`, {});
  }

  testWebhook(id: string): Observable<WebhookTestResult> {
    return this.http.post<WebhookTestResult>(`/webhooks/${id}/test`, {});
  }

  triggerWebhook(
    webhookId: string,
    responseId: string
  ): Observable<WebhookLog> {
    return this.http.post<WebhookLog>(
      `/webhooks/${webhookId}/trigger/${responseId}`,
      {}
    );
  }

  // ==================== WEBHOOK LOGS ====================

  getWebhookLogs(
    webhookId: string,
    limit = 50,
    offset = 0
  ): Observable<{ logs: WebhookLog[]; total: number }> {
    return this.http.get<{ logs: WebhookLog[]; total: number }>(
      `/webhooks/${webhookId}/logs`,
      { params: { limit: limit.toString(), offset: offset.toString() } }
    );
  }

  getSurveyWebhookLogs(
    surveyId: string,
    limit = 50,
    offset = 0
  ): Observable<{ logs: WebhookLog[]; total: number }> {
    return this.http.get<{ logs: WebhookLog[]; total: number }>(
      `/webhooks/survey/${surveyId}/logs`,
      { params: { limit: limit.toString(), offset: offset.toString() } }
    );
  }

  getDeliveryStatus(webhookId: string): Observable<WebhookDeliveryStatus> {
    return this.http.get<WebhookDeliveryStatus>(
      `/webhooks/${webhookId}/status`
    );
  }

  retryDelivery(logId: string): Observable<WebhookLog> {
    return this.http.post<WebhookLog>(`/webhooks/logs/${logId}/retry`, {});
  }
}
