import { Component, Input } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { MWQuestion, MWOfferedAnswer } from '../models';

@Component({
  selector: 'app-checkbox-question',
  templateUrl: './checkbox-question.component.html',
  styleUrls: ['./checkbox-question.component.scss']
})
export class CheckboxQuestionComponent {
  @Input() question!: MWQuestion;
  @Input() form!: FormGroup;

  answers(): MWOfferedAnswer[] {
    return this.question.offeredAnswers ?? [];
  }

  arr(): FormArray {
    return this.form.get(this.question.id) as FormArray;
  }

  toggle(value: string, checked: boolean) {
    const a = this.arr();
    if (checked) {
      a.push(new FormControl(value));
    } else {
      const i = a.controls.findIndex(c => c.value === value);
      if (i > -1) a.removeAt(i);
    }
  }
}

