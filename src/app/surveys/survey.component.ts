import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DEMO_FORM } from './demo-data';
import { MWElement, MWForm, MWOfferedAnswer } from './models';

@Component({
  selector: 'app-survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.scss']
})
export class SurveyComponent {
  formDef: MWForm = DEMO_FORM;
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({});
    this.buildForm();
  }

  private buildForm() {
    const page = this.formDef.pages[0];
    for (const el of page.elements) {
      const q = el.question;
      const key = q.id;
      switch (q.type) {
        case 'text':
          this.form.addControl(key, new FormControl('', q.required ? Validators.required : []));
          break;
        case 'textarea':
          this.form.addControl(key, new FormControl('', q.required ? Validators.required : []));
          break;
        case 'radio':
          this.form.addControl(key, new FormControl('', q.required ? Validators.required : []));
          break;
        case 'checkbox':
          this.form.addControl(key, this.fb.array([]));
          break;
        default:
          this.form.addControl(key, new FormControl(''));
      }
    }
  }

  checkboxOptions(el: MWElement) {
    return el.question.offeredAnswers ?? [];
  }

  toggleCheckbox(key: string, value: string, event: { checked: boolean }) {
    const arr = this.form.get(key) as FormArray;
    if (event.checked) {
      arr.push(new FormControl(value));
    } else {
      const index = arr.controls.findIndex(c => c.value === value);
      if (index > -1) arr.removeAt(index);
    }
  }

  radioOptions(el: MWElement): MWOfferedAnswer[] {
    return el.question.offeredAnswers ?? [];
  }

  submit() {
    if (this.form.valid) {
      console.log('Survey submit', this.form.value);
      alert('Submitted: ' + JSON.stringify(this.form.value, null, 2));
    } else {
      this.form.markAllAsTouched();
    }
  }
}
