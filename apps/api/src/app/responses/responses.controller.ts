import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import { ResponsesService } from './responses.service';
import { SubmitResponseDto } from './dto/submit-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('responses')
@Controller('responses')
export class ResponsesController {
  constructor(private readonly responsesService: ResponsesService) {}

  @Post(':surveyId')
  @ApiOperation({ summary: 'Submit a response to a survey' })
  @ApiResponse({ status: 201, description: 'Response submitted' })
  @ApiResponse({ status: 404, description: 'Survey not found' })
  async submit(
    @Param('surveyId') surveyId: string,
    @Body() submitResponseDto: SubmitResponseDto,
    @Req() req: Request
  ) {
    const metadata = {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
      referrer: req.headers['referer'],
    };
    return this.responsesService.submit(surveyId, submitResponseDto, metadata);
  }

  @Get('survey/:surveyId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all responses for a survey' })
  @ApiResponse({ status: 200, description: 'List of responses' })
  async findBySurvey(@Param('surveyId') surveyId: string) {
    return this.responsesService.findBySurvey(surveyId);
  }

  @Get('survey/:surveyId/analytics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get analytics for a survey' })
  @ApiResponse({ status: 200, description: 'Survey analytics' })
  async getAnalytics(@Param('surveyId') surveyId: string) {
    return this.responsesService.getAnalytics(surveyId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a single response' })
  @ApiResponse({ status: 200, description: 'Response details' })
  async findOne(@Param('id') id: string) {
    return this.responsesService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a response' })
  @ApiResponse({ status: 200, description: 'Response deleted' })
  async remove(@Param('id') id: string) {
    return this.responsesService.remove(id);
  }
}
