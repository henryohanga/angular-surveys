import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MWOfferedAnswer, MWQuestion } from '../models';

@Component({
  selector: 'app-select-question',
  templateUrl: './select-question.component.html',
  styleUrls: ['./select-question.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectQuestionComponent {
  @Input() question!: MWQuestion;
  @Input() form!: FormGroup;

  answers(): MWOfferedAnswer[] { return this.question.offeredAnswers ?? []; }
}
