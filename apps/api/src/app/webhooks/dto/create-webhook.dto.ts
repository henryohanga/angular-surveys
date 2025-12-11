import {
  IsString,
  IsUrl,
  IsOptional,
  IsArray,
  IsBoolean,
  IsObject,
  ArrayNotEmpty,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const WEBHOOK_EVENTS = [
  'response.submitted',
  'response.updated',
  'response.deleted',
  'survey.published',
  'survey.unpublished',
] as const;

export class CreateWebhookDto {
  @ApiProperty({ description: 'Webhook URL to POST to' })
  @IsUrl({ require_tld: false }, { message: 'Invalid URL format' })
  url!: string;

  @ApiProperty({ description: 'Human-readable name for the webhook' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ description: 'Optional description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Events that trigger this webhook',
    enum: WEBHOOK_EVENTS,
    isArray: true,
    default: ['response.submitted'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsIn(WEBHOOK_EVENTS, { each: true })
  events!: string[];

  @ApiPropertyOptional({ description: 'Custom headers to include' })
  @IsOptional()
  @IsObject()
  headers?: Record<string, string>;

  @ApiPropertyOptional({
    description: 'Whether to include respondent metadata',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  includeMetadata?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to use question mappings in payload',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  useQuestionMappings?: boolean;
}
