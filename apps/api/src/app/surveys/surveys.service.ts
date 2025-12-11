import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Survey, SurveyStatus } from './entities/survey.entity';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { UpdateSurveyDto } from './dto/update-survey.dto';
import { v4 as uuidv4 } from 'uuid';
import { WebhooksService } from '../webhooks/webhooks.service';

@Injectable()
export class SurveysService {
  constructor(
    @InjectRepository(Survey)
    private readonly surveysRepository: Repository<Survey>,
    @Inject(forwardRef(() => WebhooksService))
    private readonly webhooksService: WebhooksService
  ) {}

  async create(
    createSurveyDto: CreateSurveyDto,
    ownerId?: string
  ): Promise<Survey> {
    const survey = this.surveysRepository.create({
      ...createSurveyDto,
      ownerId,
      form: createSurveyDto.form || {
        name: createSurveyDto.name,
        description: createSurveyDto.description,
        pages: [
          {
            id: uuidv4(),
            number: 1,
            name: 'Page 1',
            elements: [],
          },
        ],
      },
    });
    return this.surveysRepository.save(survey);
  }

  async findAll(ownerId?: string): Promise<Survey[]> {
    const where = ownerId ? { ownerId } : {};
    return this.surveysRepository.find({
      where,
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Survey> {
    const survey = await this.surveysRepository.findOne({ where: { id } });
    if (!survey) {
      throw new NotFoundException('Survey not found');
    }
    return survey;
  }

  async findPublished(id: string): Promise<Survey> {
    const survey = await this.surveysRepository.findOne({
      where: { id, status: 'published' as SurveyStatus },
    });
    if (!survey) {
      throw new NotFoundException('Survey not found or not published');
    }
    return survey;
  }

  async update(id: string, updateSurveyDto: UpdateSurveyDto): Promise<Survey> {
    const survey = await this.findOne(id);
    Object.assign(survey, updateSurveyDto);
    return this.surveysRepository.save(survey);
  }

  async publish(id: string): Promise<Survey> {
    const survey = await this.findOne(id);
    survey.status = 'published';
    survey.publishedAt = new Date();
    survey.shareUrl = `/s/${id}`;
    const saved = await this.surveysRepository.save(survey);

    // Trigger webhooks for survey.published event
    this.webhooksService
      .triggerWebhooks(id, 'survey.published')
      .catch((err) => {
        console.error('Failed to trigger webhooks for publish:', err);
      });

    return saved;
  }

  async unpublish(id: string): Promise<Survey> {
    const survey = await this.findOne(id);
    survey.status = 'draft';
    survey.shareUrl = undefined;
    const saved = await this.surveysRepository.save(survey);

    // Trigger webhooks for survey.unpublished event
    this.webhooksService
      .triggerWebhooks(id, 'survey.unpublished')
      .catch((err) => {
        console.error('Failed to trigger webhooks for unpublish:', err);
      });

    return saved;
  }

  async duplicate(id: string, ownerId?: string): Promise<Survey> {
    const original = await this.findOne(id);
    const newSurvey = this.surveysRepository.create({
      name: `${original.name} (Copy)`,
      description: original.description,
      form: original.form,
      settings: original.settings,
      ownerId,
      status: 'draft',
    });
    return this.surveysRepository.save(newSurvey);
  }

  async remove(id: string): Promise<void> {
    const result = await this.surveysRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Survey not found');
    }
  }

  async incrementResponseCount(id: string): Promise<void> {
    await this.surveysRepository.increment({ id }, 'responseCount', 1);
  }
}
