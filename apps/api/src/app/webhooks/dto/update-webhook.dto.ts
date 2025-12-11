import { PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateWebhookDto } from './create-webhook.dto';

export class UpdateWebhookDto extends PartialType(CreateWebhookDto) {
  @ApiPropertyOptional({ description: 'Whether this webhook is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
