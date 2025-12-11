import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResponsesController } from './responses.controller';
import { ResponsesService } from './responses.service';
import { SurveyResponse } from './entities/response.entity';
import { SurveysModule } from '../surveys/surveys.module';
import { WebhooksModule } from '../webhooks/webhooks.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SurveyResponse]),
    SurveysModule,
    forwardRef(() => WebhooksModule),
  ],
  controllers: [ResponsesController],
  providers: [ResponsesService],
  exports: [ResponsesService],
})
export class ResponsesModule {}
