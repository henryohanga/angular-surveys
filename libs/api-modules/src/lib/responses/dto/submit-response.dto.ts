import { IsObject, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitResponseDto {
  @ApiProperty({ description: 'Response data keyed by question ID' })
  @IsObject()
  responses!: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Time taken to complete in seconds' })
  @IsOptional()
  @IsNumber()
  completionTime?: number;
}
