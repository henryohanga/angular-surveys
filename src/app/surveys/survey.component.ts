import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MWForm } from './models';
import { FormStateService } from '../builder/form-state.service';

@Component({
  selector: 'app-survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.scss']
})
export class SurveyComponent {
  formDef!: MWForm;
  form: FormGroup;
  currentPage = 0;

  constructor(private fb: FormBuilder, private state: FormStateService) {
    this.formDef = this.state.getForm();
    this.form = this.fb.group({});
    this.buildForm();
  }

  private buildForm() {
    for (const page of this.formDef.pages) {
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
            {
              const arr = this.fb.array([]);
              if (q.required) {
                arr.addValidators(this.minSelectedValidator(1));
              }
              this.form.addControl(key, arr);
            }
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
  }

  private minSelectedValidator(min: number): ValidatorFn {
    return (control: AbstractControl) => {
      const arr = control as FormArray;
      return arr.length >= min ? null : { minSelected: { required: min, actual: arr.length } };
    };
  }

  private pageQuestionIds(index: number): string[] {
    return this.formDef.pages[index].elements.map(e => e.question.id);
  }

  private validatePage(index: number): boolean {
    const ids = this.pageQuestionIds(index);
    for (const id of ids) {
      const control = this.form.get(id);
      if (control) {
        control.markAsTouched();
        control.updateValueAndValidity();
        if (control.invalid) return false;
      }
    }
    return true;
  }

  next() {
    if (!this.validatePage(this.currentPage)) return;
    const page = this.formDef.pages[this.currentPage];
    let targetIndex = this.currentPage + 1;
    for (const el of page.elements) {
      const q = el.question;
      if (q.type === 'radio' && q.offeredAnswers && q.pageFlowModifier !== false) {
        const selected = this.form.get(q.id)?.value as string;
        const found = q.offeredAnswers.find(a => a.value === selected);
        const flow = found?.pageFlow;
        if (flow?.goToPage) {
          const idx = this.formDef.pages.findIndex(p => p.number === flow.goToPage);
          if (idx >= 0) {
            targetIndex = idx;
            break;
          }
        } else if (flow?.nextPage) {
          targetIndex = this.currentPage + 1;
        }
      }
      if (q.type === 'checkbox' && q.offeredAnswers && q.pageFlowModifier) {
        const selectedControl = this.form.get(q.id);
        const selectedArr = (selectedControl?.value as string[]) || [];
        const first = q.offeredAnswers.find(a => selectedArr?.includes(a.value));
        const flow = first?.pageFlow;
        if (flow?.goToPage) {
          const idx = this.formDef.pages.findIndex(p => p.number === flow.goToPage);
          if (idx >= 0) {
            targetIndex = idx;
            break;
          }
        } else if (flow?.nextPage) {
          targetIndex = this.currentPage + 1;
        }
      }
    }
    if (targetIndex < this.formDef.pages.length) this.currentPage = targetIndex;
  }

  prev() {
    if (this.currentPage > 0) this.currentPage--;
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
