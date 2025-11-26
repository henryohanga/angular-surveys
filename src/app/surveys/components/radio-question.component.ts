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

  otherValue = '';

  answers(): MWOfferedAnswer[] {
    return this.question.offeredAnswers ?? [];
  }

  onRadioChange(value: string) {
    if (value !== '__other__') {
      this.otherValue = '';
    } else {
      const ctrl = this.form.get(this.question.id);
      if (ctrl && this.otherValue) ctrl.setValue(this.otherValue);
    }
  }

  onOtherInput(ev: Event) {
    const input = ev.target as HTMLInputElement;
    this.otherValue = input.value;
    const groupVal = this.form.get(this.question.id)?.value as string;
    if (groupVal === '__other__' || !this.answers().find(a => a.value === groupVal)) {
      this.form.get(this.question.id)?.setValue(this.otherValue);
    }
  }
}
