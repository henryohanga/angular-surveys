import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { MWQuestion, MWOfferedAnswer } from '../models';

@Component({
  standalone: false,
  selector: 'app-checkbox-question',
  templateUrl: './checkbox-question.component.html',
  styleUrls: ['./checkbox-question.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckboxQuestionComponent {
  @Input() question!: MWQuestion;
  @Input() form!: FormGroup;
  otherValue = '';
  otherChecked = false;

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

  toggleOther(checked: boolean) {
    this.otherChecked = checked;
    const a = this.arr();
    const i = a.controls.findIndex(c => c.value === this.otherValue);
    if (checked) {
      if (this.otherValue && i === -1) a.push(new FormControl(this.otherValue));
    } else {
      if (i > -1) a.removeAt(i);
    }
  }

  onOtherInput(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const old = this.otherValue;
    this.otherValue = input.value;
    if (this.otherChecked) {
      const a = this.arr();
      const i = a.controls.findIndex(c => c.value === old);
      if (i > -1) a.at(i).setValue(this.otherValue);
      else if (this.otherValue) a.push(new FormControl(this.otherValue));
    }
  }
}
