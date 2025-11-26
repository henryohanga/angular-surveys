import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MWQuestion } from '../models';

@Component({
  selector: 'app-date-question',
  templateUrl: './date-question.component.html',
  styleUrls: ['./date-question.component.scss']
})
export class DateQuestionComponent {
  @Input() question!: MWQuestion;
  @Input() form!: FormGroup;
}

