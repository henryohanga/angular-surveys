import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MWQuestion } from '../models';

@Component({
  selector: 'app-time-question',
  templateUrl: './time-question.component.html',
  styleUrls: ['./time-question.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimeQuestionComponent {
  @Input() question!: MWQuestion;
  @Input() form!: FormGroup;
}
