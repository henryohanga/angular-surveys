import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MWQuestion, MWOfferedAnswer } from '../models';

@Component({
  selector: 'app-radio-question',
  templateUrl: './radio-question.component.html',
  styleUrls: ['./radio-question.component.scss']
})
export class RadioQuestionComponent {
  @Input() question!: MWQuestion;
  @Input() form!: FormGroup;

  answers(): MWOfferedAnswer[] {
    return this.question.offeredAnswers ?? [];
  }
}

