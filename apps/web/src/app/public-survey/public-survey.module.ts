import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PublicSurveyComponent } from './public-survey.component';
import { SurveysModule } from '../surveys/surveys.module';

@NgModule({
  declarations: [PublicSurveyComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    SurveysModule,
  ],
  exports: [PublicSurveyComponent],
})
export class PublicSurveyModule {}
