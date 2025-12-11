import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSurveyDto {
  @ApiPropertyOptional({ example: 'Updated Survey Name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  form?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  settings?: Record<string, unknown>;

  @ApiPropertyOptional({
    description:
      'Developer mode settings including API keys and question mappings',
  })
  @IsOptional()
  @IsObject()
  developerSettings?: {
    enabled?: boolean;
    apiKey?: string;
    apiSecret?: string;
    questionMappings?: {
      questionId: string;
      externalId: string;
      fieldName?: string;
      description?: string;
    }[];
    customMetadataFields?: string[];
  };
}
