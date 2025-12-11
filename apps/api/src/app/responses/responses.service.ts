import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SurveyResponse } from './entities/response.entity';
import { SubmitResponseDto } from './dto/submit-response.dto';
import { SurveysService } from '../surveys/surveys.service';
import { WebhooksService } from '../webhooks/webhooks.service';

@Injectable()
export class ResponsesService {
  constructor(
    @InjectRepository(SurveyResponse)
    private readonly responsesRepository: Repository<SurveyResponse>,
    private readonly surveysService: SurveysService,
    @Inject(forwardRef(() => WebhooksService))
    private readonly webhooksService: WebhooksService
  ) {}

  async submit(
    surveyId: string,
    submitResponseDto: SubmitResponseDto,
    metadata?: Record<string, unknown>
  ): Promise<SurveyResponse> {
    // Verify survey exists and is published
    await this.surveysService.findPublished(surveyId);

    const response = this.responsesRepository.create({
      surveyId,
      responses: submitResponseDto.responses,
      metadata: metadata as SurveyResponse['metadata'],
      isComplete: true,
      completedAt: new Date(),
    });

    const saved = await this.responsesRepository.save(response);

    // Increment response count
    await this.surveysService.incrementResponseCount(surveyId);

    // Trigger webhooks asynchronously
    this.webhooksService
      .triggerWebhooks(surveyId, 'response.submitted', saved)
      .catch((err) => {
        console.error('Failed to trigger webhooks:', err);
      });

    return saved;
  }

  async findBySurvey(surveyId: string): Promise<SurveyResponse[]> {
    return this.responsesRepository.find({
      where: { surveyId },
      order: { submittedAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<SurveyResponse> {
    const response = await this.responsesRepository.findOne({ where: { id } });
    if (!response) {
      throw new NotFoundException('Response not found');
    }
    return response;
  }

  async remove(id: string): Promise<void> {
    const result = await this.responsesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Response not found');
    }
  }

  async getAnalytics(surveyId: string) {
    const responses = await this.findBySurvey(surveyId);

    const completedResponses = responses.filter((r) => r.isComplete);
    const avgCompletionTime =
      completedResponses.length > 0
        ? completedResponses.reduce(
            (acc, r) => acc + (r.metadata?.completionTime || 0),
            0
          ) / completedResponses.length
        : 0;

    return {
      surveyId,
      totalResponses: responses.length,
      completedResponses: completedResponses.length,
      completionRate:
        responses.length > 0
          ? (completedResponses.length / responses.length) * 100
          : 0,
      averageCompletionTime: avgCompletionTime,
      responsesByDate: this.groupByDate(responses),
    };
  }

  private groupByDate(responses: SurveyResponse[]) {
    const grouped: Record<string, number> = {};
    for (const response of responses) {
      const date = response.submittedAt.toISOString().split('T')[0];
      grouped[date] = (grouped[date] || 0) + 1;
    }
    return Object.entries(grouped).map(([date, count]) => ({ date, count }));
  }
}
