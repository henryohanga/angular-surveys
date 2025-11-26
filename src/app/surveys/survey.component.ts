import { Component } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MWForm, MWPage, MWOfferedAnswer } from './models';
import { FormStateService } from '../builder/form-state.service';

@Component({
  selector: 'app-survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.scss'],
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
            this.form.addControl(
              key,
              new FormControl('', q.required ? Validators.required : [])
            );
            break;
          case 'textarea':
            this.form.addControl(
              key,
              new FormControl('', q.required ? Validators.required : [])
            );
            break;
          case 'radio':
            this.form.addControl(
              key,
              new FormControl('', q.required ? Validators.required : [])
            );
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
          case 'select':
            this.form.addControl(
              key,
              new FormControl('', q.required ? Validators.required : [])
            );
            break;
          case 'date':
            this.form.addControl(
              key,
              new FormControl('', q.required ? Validators.required : [])
            );
            break;
          case 'time':
            this.form.addControl(
              key,
              new FormControl('', q.required ? Validators.required : [])
            );
            break;
          case 'scale':
            this.form.addControl(
              key,
              new FormControl(
                q.scale?.min ?? 1,
                q.required ? Validators.required : []
              )
            );
            break;
          case 'grid': {
            const group = this.fb.group({});
            const grid = q.grid!;
            for (const row of grid.rows) {
              if (grid.cellInputType === 'radio') {
                const ctrl = new FormControl('');
                if (q.required) ctrl.addValidators(Validators.required);
                group.addControl(row.id, ctrl);
              } else {
                const arr = this.fb.array([]);
                if (q.required) arr.addValidators(this.minSelectedValidator(1));
                group.addControl(row.id, arr);
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
      return arr.length >= min
        ? null
        : { minSelected: { required: min, actual: arr.length } };
    };
  }

  private pageQuestionIds(index: number): string[] {
    return this.formDef.pages[index].elements.map((e) => e.question.id);
  }

  private answerFlowTarget(ans?: MWOfferedAnswer): number | null {
    const flow = ans?.pageFlow;
    if (!flow) return null;
    if (typeof flow.goToPage === 'number') {
      const idx = this.formDef.pages.findIndex(
        (p) => p.number === flow.goToPage
      );
      return idx >= 0 ? idx : null;
    }
    if (flow.nextPage === true) return this.currentPage + 1;
    if (flow.nextPage === false) return this.currentPage; // stay on page
    return null;
  }

  private resolveNextPageIndex(page: MWPage): number | null {
    // element-level overrides (first match wins)
    for (const el of page.elements) {
      const q = el.question;
      if (q.pageFlowModifier) {
        if (q.type === 'radio' && q.offeredAnswers) {
          const selected = this.form.get(q.id)?.value as string;
          const ans = q.offeredAnswers.find((a) => a.value === selected);
          const target = this.answerFlowTarget(ans);
          if (target !== null) return target;
        } else if (q.type === 'checkbox' && q.offeredAnswers) {
          const selectedArr = (this.form.get(q.id)?.value as string[]) || [];
          const first = q.offeredAnswers.find((a) =>
            selectedArr.includes(a.value)
          );
          const target = this.answerFlowTarget(first);
          if (target !== null) return target;
        }
      }
    }

    // page-level flow
    const flow = page.pageFlow;
    if (flow) {
      if (typeof flow.goToPage === 'number') {
        const idx = this.formDef.pages.findIndex(
          (p) => p.number === flow.goToPage
        );
        return idx >= 0 ? idx : null;
      }
      if (flow.nextPage === true) return this.currentPage + 1;
      if (flow.nextPage === false) return this.currentPage;
    }

    // default: next page
    return this.currentPage + 1;
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
    const targetIndex = this.resolveNextPageIndex(page) ?? this.currentPage + 1;
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
