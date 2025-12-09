import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResponsesController } from './responses.controller';
import { ResponsesService } from './responses.service';
import { SurveyResponse } from './entities/response.entity';
import { SurveysModule } from '../surveys/surveys.module';

@Module({
  imports: [TypeOrmModule.forFeature([SurveyResponse]), SurveysModule],
  controllers: [ResponsesController],
  providers: [ResponsesService],
  exports: [ResponsesService],
})
export class ResponsesModule {}
