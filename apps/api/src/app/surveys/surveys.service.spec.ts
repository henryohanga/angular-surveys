import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { SurveysService } from './surveys.service';
import { WebhooksService } from '../webhooks/webhooks.service';
import { Survey } from './entities/survey.entity';

describe('SurveysService', () => {
  let service: SurveysService;
  let repository: jest.Mocked<Repository<Survey>>;

  const mockSurvey: Partial<Survey> = {
    id: 'survey-123',
    name: 'Test Survey',
    description: 'A test survey',
    status: 'draft',
    form: { pages: [] },
    responseCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
      increment: jest.fn(),
    };
    const mockWebhooksService = {
      triggerWebhooks: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SurveysService,
        { provide: getRepositoryToken(Survey), useValue: mockRepository },
        { provide: WebhooksService, useValue: mockWebhooksService },
      ],
    }).compile();

    service = module.get<SurveysService>(SurveysService);
    repository = module.get(getRepositoryToken(Survey));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new survey', async () => {
      const createDto = { name: 'New Survey', description: 'Description' };
      repository.create.mockReturnValue(mockSurvey as Survey);
      repository.save.mockResolvedValue(mockSurvey as Survey);

      const result = await service.create(createDto, 'owner-123');

      expect(result).toEqual(mockSurvey);
      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all surveys for an owner', async () => {
      repository.find.mockResolvedValue([mockSurvey as Survey]);

      const result = await service.findAll('owner-123');

      expect(result).toHaveLength(1);
      expect(repository.find).toHaveBeenCalledWith({
        where: { ownerId: 'owner-123' },
        order: { updatedAt: 'DESC' },
      });
    });

    it('should return all surveys when no owner specified', async () => {
      repository.find.mockResolvedValue([mockSurvey as Survey]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(repository.find).toHaveBeenCalledWith({
        where: {},
        order: { updatedAt: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a survey by id', async () => {
      repository.findOne.mockResolvedValue(mockSurvey as Survey);

      const result = await service.findOne('survey-123');

      expect(result).toEqual(mockSurvey);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'survey-123' },
      });
    });

    it('should throw NotFoundException if survey not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('unknown')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('publish', () => {
    it('should publish a survey', async () => {
      repository.findOne.mockResolvedValue(mockSurvey as Survey);
      repository.save.mockResolvedValue({
        ...mockSurvey,
        status: 'published',
        publishedAt: expect.any(Date),
        shareUrl: '/s/survey-123',
      } as Survey);

      const result = await service.publish('survey-123');

      expect(result.status).toBe('published');
      expect(result.shareUrl).toBe('/s/survey-123');
    });
  });

  describe('remove', () => {
    it('should delete a survey', async () => {
      repository.delete.mockResolvedValue({ affected: 1, raw: {} });

      await service.remove('survey-123');

      expect(repository.delete).toHaveBeenCalledWith('survey-123');
    });

    it('should throw NotFoundException if survey not found', async () => {
      repository.delete.mockResolvedValue({ affected: 0, raw: {} });

      await expect(service.remove('unknown')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('incrementResponseCount', () => {
    it('should increment the response count', async () => {
      repository.increment.mockResolvedValue({
        affected: 1,
        raw: {},
        generatedMaps: [],
      });

      await service.incrementResponseCount('survey-123');

      expect(repository.increment).toHaveBeenCalledWith(
        { id: 'survey-123' },
        'responseCount',
        1
      );
    });
  });
});
