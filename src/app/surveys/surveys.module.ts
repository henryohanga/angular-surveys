import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SurveyComponent } from './survey.component';
import { TextQuestionComponent } from './components/text-question.component';
import { TextareaQuestionComponent } from './components/textarea-question.component';
import { RadioQuestionComponent } from './components/radio-question.component';
import { CheckboxQuestionComponent } from './components/checkbox-question.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatTableModule } from '@angular/material/table';
import { GridQuestionComponent } from './components/grid-question.component';
import { PriorityQuestionComponent } from './components/priority-question.component';
import { QuestionHostComponent } from './components/question-host.component';
import { QUESTION_COMPONENTS } from './registry';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MaterialSurveyComponent } from './material-survey.component';

@NgModule({
  declarations: [
    SurveyComponent,
    TextQuestionComponent,
    TextareaQuestionComponent,
    RadioQuestionComponent,
    CheckboxQuestionComponent,
    GridQuestionComponent,
    PriorityQuestionComponent,
    QuestionHostComponent,
    MaterialSurveyComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatCheckboxModule,
    MatButtonModule,
    MatCardModule,
    DragDropModule,
    MatTableModule,
    MatToolbarModule,
  ],
  exports: [
    TextQuestionComponent,
    TextareaQuestionComponent,
    RadioQuestionComponent,
    CheckboxQuestionComponent,
    GridQuestionComponent,
    PriorityQuestionComponent,
    SurveyComponent,
    QuestionHostComponent,
    MaterialSurveyComponent,
  ]
  ,providers: [
    {
      provide: QUESTION_COMPONENTS,
      useValue: {
        text: TextQuestionComponent,
        textarea: TextareaQuestionComponent,
        radio: RadioQuestionComponent,
        checkbox: CheckboxQuestionComponent,
        grid: GridQuestionComponent,
        priority: PriorityQuestionComponent,
      }
    }
  ]
})
export class SurveysModule {}
