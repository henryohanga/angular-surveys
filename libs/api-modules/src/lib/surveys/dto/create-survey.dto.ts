import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSurveyDto {
  @ApiProperty({ example: 'Customer Satisfaction Survey' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 'A survey to gather customer feedback' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  form?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  templateId?: string;
}
