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
  showSummary = false;

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
          case 'email':
            this.form.addControl(
              key,
              new FormControl('', [
                ...(q.required ? [Validators.required] : []),
                Validators.email,
              ])
            );
            break;
          case 'url': {
            const urlPattern = /^(https?:\/\/)?[^\s/$.?#].[^\s]*$/i;
            this.form.addControl(
              key,
              new FormControl('', [
                ...(q.required ? [Validators.required] : []),
                Validators.pattern(urlPattern),
              ])
            );
            break;
          }
          case 'phone': {
            const phonePattern = /^[+]?\d[\d\s()-]{6,}$/;
            this.form.addControl(
              key,
              new FormControl('', [
                ...(q.required ? [Validators.required] : []),
                Validators.pattern(phonePattern),
              ])
            );
            break;
          }
          case 'number': {
            const validators = [] as ValidatorFn[];
            if (q.required) validators.push(Validators.required);
            if (q.numberConfig?.min !== undefined)
              validators.push(Validators.min(q.numberConfig.min));
            if (q.numberConfig?.max !== undefined)
              validators.push(Validators.max(q.numberConfig.max));
            this.form.addControl(key, new FormControl(null, validators));
            break;
          }
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
              arr.push(new FormControl(item.value, Validators.required));
            }
            if (q.required) arr.addValidators(this.arrayLengthMinValidator(1));
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

  private arrayLengthMinValidator(min: number): ValidatorFn {
    return (control: AbstractControl) => {
      const arr = control as FormArray;
      return arr.length >= min
        ? null
        : { minLengthArray: { required: min, actual: arr.length } };
    };
  }

  private answerLabel(qId: string, value: unknown): string {
    const q = this.formDef.pages
      .map((p) => p.elements)
      .reduce((acc, cur) => acc.concat(cur), [])
      .map((e) => e.question)
      .find((qq) => qq.id === qId);
    if (!q) return String(value ?? '');
    if (q.type === 'radio' && q.offeredAnswers) {
      const v = typeof value === 'string' ? value : '';
      const found = q.offeredAnswers.find((a) => a.value === v);
      return found ? found.value : String(value ?? '');
    }
    if (Array.isArray(value)) {
      return (value as unknown[]).map((v) => String(v ?? '')).join(', ');
    }
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }
    return String(value ?? '');
  }

  gridRowsFor(qId: string): { id: string; label: string }[] {
    const q = this.formDef.pages
      .map((p) => p.elements)
      .reduce((acc, cur) => acc.concat(cur), [])
      .map((e) => e.question)
      .find((qq) => qq.id === qId);
    return q?.grid?.rows?.map((r) => ({ id: r.id, label: r.label })) ?? [];
  }

  gridRowInvalid(qId: string, rowId: string): boolean {
    const group = this.form.get(qId) as FormGroup;
    const ctrl = group?.get(rowId);
    return !!ctrl && ctrl.invalid;
  }

  gridRowValueLabel(qId: string, rowId: string): string {
    const group = this.form.get(qId) as FormGroup;
    const q = this.formDef.pages
      .map((p) => p.elements)
      .reduce((acc, cur) => acc.concat(cur), [])
      .map((e) => e.question)
      .find((qq) => qq.id === qId);
    if (!group || !q || !q.grid) return '';
    const val = group.get(rowId)?.value;
    if (q.grid.cellInputType === 'radio') {
      const found = q.grid.cols.find((c) => c.id === val);
      return found ? found.label : String(val || '');
    } else {
      const arr = val as string[];
      const labels = (arr || []).map(
        (cid) => q.grid!.cols.find((c) => c.id === cid)?.label || cid
      );
      return labels.join(', ');
    }
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
    else this.showSummary = true;
  }

  prev() {
    if (this.showSummary) {
      this.showSummary = false;
      return;
    }
    if (this.currentPage > 0) this.currentPage--;
  }

  submit() {
    if (this.form.valid) {
      console.log('Survey submit', this.form.value);
      alert('Submitted: ' + JSON.stringify(this.form.value, null, 2));
    } else {
      this.form.markAllAsTouched();
      this.showSummary = false;
    }
  }
}
