import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MWQuestion } from '../models';

@Component({
  selector: 'app-text-question',
  templateUrl: './text-question.component.html',
  styleUrls: ['./text-question.component.scss']
})
export class TextQuestionComponent {
  @Input() question!: MWQuestion;
  @Input() form!: FormGroup;

  inputType(): string {
    if (this.question.type === 'email') return 'email';
    if (this.question.type === 'url') return 'url';
    if (this.question.type === 'number') return 'number';
    if (this.question.type === 'phone') return 'tel';
    return 'text';
  }

  placeholder(): string | null {
    return this.question.placeholder ?? null;
  }

  min(): number | null {
    return this.question.numberConfig?.min ?? null;
  }

  max(): number | null {
    return this.question.numberConfig?.max ?? null;
  }

  step(): number | null {
    return this.question.numberConfig?.step ?? null;
  }
}
