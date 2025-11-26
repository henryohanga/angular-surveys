import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DEMO_FORM } from './demo-data';
import { MWForm } from './models';

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
        case 'grid': {
          const group = this.fb.group({});
          const grid = q.grid!;
          for (const row of grid.rows) {
            if (grid.cellInputType === 'radio') {
              group.addControl(row.id, new FormControl(''));
            } else {
              group.addControl(row.id, this.fb.array([]));
            }
          }
          this.form.addControl(key, group);
          break;
        }
        case 'priority': {
          const arr = this.fb.array([]);
          for (const item of q.priorityList ?? []) {
            arr.push(new FormControl(item.value));
          }
          this.form.addControl(key, arr);
          break;
        }
        default:
          this.form.addControl(key, new FormControl(''));
      }
    }
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
