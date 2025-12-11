import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('webhooks')
@Controller('webhooks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('survey/:surveyId')
  @ApiOperation({ summary: 'Create a webhook for a survey' })
  @ApiResponse({ status: 201, description: 'Webhook created' })
  @ApiResponse({ status: 404, description: 'Survey not found' })
  async create(
    @Param('surveyId') surveyId: string,
    @Body() createWebhookDto: CreateWebhookDto
  ) {
    return this.webhooksService.create(surveyId, createWebhookDto);
  }

  @Get('survey/:surveyId')
  @ApiOperation({ summary: 'Get all webhooks for a survey' })
  @ApiResponse({ status: 200, description: 'List of webhooks' })
  async findAllBySurvey(@Param('surveyId') surveyId: string) {
    return this.webhooksService.findAllBySurvey(surveyId);
  }

  @Get('survey/:surveyId/logs')
  @ApiOperation({ summary: 'Get webhook logs for a survey' })
  @ApiResponse({ status: 200, description: 'List of webhook logs' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getLogsBySurvey(
    @Param('surveyId') surveyId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number
  ) {
    return this.webhooksService.getLogsBySurvey(surveyId, limit, offset);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a webhook by ID' })
  @ApiResponse({ status: 200, description: 'Webhook details' })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  async findOne(@Param('id') id: string) {
    return this.webhooksService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a webhook' })
  @ApiResponse({ status: 200, description: 'Webhook updated' })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  async update(
    @Param('id') id: string,
    @Body() updateWebhookDto: UpdateWebhookDto
  ) {
    return this.webhooksService.update(id, updateWebhookDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a webhook' })
  @ApiResponse({ status: 200, description: 'Webhook deleted' })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  async remove(@Param('id') id: string) {
    return this.webhooksService.remove(id);
  }

  @Post(':id/regenerate-secret')
  @ApiOperation({ summary: 'Regenerate webhook secret' })
  @ApiResponse({ status: 200, description: 'Secret regenerated' })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  async regenerateSecret(@Param('id') id: string) {
    return this.webhooksService.regenerateSecret(id);
  }

  @Get(':id/logs')
  @ApiOperation({ summary: 'Get delivery logs for a webhook' })
  @ApiResponse({ status: 200, description: 'List of delivery logs' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getLogs(
    @Param('id') id: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number
  ) {
    return this.webhooksService.getLogs(id, limit, offset);
  }

  @Get(':id/status')
  @ApiOperation({ summary: 'Get delivery status summary for a webhook' })
  @ApiResponse({ status: 200, description: 'Delivery status summary' })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  async getDeliveryStatus(@Param('id') id: string) {
    return this.webhooksService.getDeliveryStatus(id);
  }

  @Post(':id/test')
  @ApiOperation({ summary: 'Test a webhook with sample payload' })
  @ApiResponse({ status: 200, description: 'Test result' })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  async testWebhook(@Param('id') id: string) {
    return this.webhooksService.testWebhook(id);
  }

  @Post(':webhookId/trigger/:responseId')
  @ApiOperation({ summary: 'Manually trigger a webhook for a response' })
  @ApiResponse({ status: 201, description: 'Webhook triggered' })
  @ApiResponse({ status: 404, description: 'Webhook or response not found' })
  async triggerManual(
    @Param('webhookId') webhookId: string,
    @Param('responseId') responseId: string
  ) {
    return this.webhooksService.triggerManual(webhookId, responseId);
  }

  @Post('logs/:logId/retry')
  @ApiOperation({ summary: 'Retry a failed webhook delivery' })
  @ApiResponse({ status: 201, description: 'Retry initiated' })
  @ApiResponse({ status: 400, description: 'Cannot retry successful delivery' })
  @ApiResponse({ status: 404, description: 'Log not found' })
  async retryDelivery(@Param('logId') logId: string) {
    return this.webhooksService.retryDelivery(logId);
  }
}
