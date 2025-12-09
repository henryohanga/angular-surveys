import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SurveysService } from './surveys.service';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { UpdateSurveyDto } from './dto/update-survey.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalAuthGuard } from '../auth/guards/optional-auth.guard';

interface RequestUser {
  id: string;
  email: string;
}

@ApiTags('surveys')
@Controller('surveys')
export class SurveysController {
  constructor(private readonly surveysService: SurveysService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new survey' })
  @ApiResponse({ status: 201, description: 'Survey created' })
  async create(
    @Request() req: { user: RequestUser },
    @Body() createSurveyDto: CreateSurveyDto
  ) {
    return this.surveysService.create(createSurveyDto, req.user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all surveys for current user' })
  @ApiResponse({ status: 200, description: 'List of surveys' })
  async findAll(@Request() req: { user: RequestUser }) {
    return this.surveysService.findAll(req.user.id);
  }

  @Get(':id')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'Get a survey by ID' })
  @ApiResponse({ status: 200, description: 'Survey details' })
  @ApiResponse({ status: 404, description: 'Survey not found' })
  async findOne(@Param('id') id: string) {
    return this.surveysService.findOne(id);
  }

  @Get(':id/public')
  @ApiOperation({ summary: 'Get a published survey for public access' })
  @ApiResponse({ status: 200, description: 'Published survey' })
  @ApiResponse({ status: 404, description: 'Survey not found' })
  async findPublished(@Param('id') id: string) {
    return this.surveysService.findPublished(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a survey' })
  @ApiResponse({ status: 200, description: 'Survey updated' })
  async update(
    @Param('id') id: string,
    @Body() updateSurveyDto: UpdateSurveyDto
  ) {
    return this.surveysService.update(id, updateSurveyDto);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish a survey' })
  @ApiResponse({ status: 200, description: 'Survey published' })
  async publish(@Param('id') id: string) {
    return this.surveysService.publish(id);
  }

  @Post(':id/unpublish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unpublish a survey' })
  @ApiResponse({ status: 200, description: 'Survey unpublished' })
  async unpublish(@Param('id') id: string) {
    return this.surveysService.unpublish(id);
  }

  @Post(':id/duplicate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Duplicate a survey' })
  @ApiResponse({ status: 201, description: 'Survey duplicated' })
  async duplicate(
    @Request() req: { user: RequestUser },
    @Param('id') id: string
  ) {
    return this.surveysService.duplicate(id, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a survey' })
  @ApiResponse({ status: 200, description: 'Survey deleted' })
  async remove(@Param('id') id: string) {
    return this.surveysService.remove(id);
  }
}
