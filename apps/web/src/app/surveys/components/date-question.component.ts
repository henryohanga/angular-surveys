import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MWQuestion } from '../models';

@Component({
  standalone: false,
  selector: 'app-date-question',
  templateUrl: './date-question.component.html',
  styleUrls: ['./date-question.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DateQuestionComponent {
  @Input() question!: MWQuestion;
  @Input() form!: FormGroup;
}
