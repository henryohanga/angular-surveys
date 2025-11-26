import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MWQuestion } from '../models';

@Component({
  selector: 'app-scale-question',
  templateUrl: './scale-question.component.html',
  styleUrls: ['./scale-question.component.scss']
})
export class ScaleQuestionComponent {
  @Input() question!: MWQuestion;
  @Input() form!: FormGroup;

  min(): number { return this.question.scale?.min ?? 1; }
  max(): number { return this.question.scale?.max ?? 5; }
  step(): number { return this.question.scale?.step ?? 1; }
}

