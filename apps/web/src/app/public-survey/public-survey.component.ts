import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  FormArray,
  Validators,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
import { StorageService, Survey } from '../core/services/storage.service';
import { MWForm, MWPage, MWOfferedAnswer } from '../surveys/models';

@Component({
  selector: 'app-public-survey',
  templateUrl: './public-survey.component.html',
  styleUrls: ['./public-survey.component.scss'],
})
export class PublicSurveyComponent implements OnInit {
  survey: Survey | null = null;
  formDef!: MWForm;
  form!: FormGroup;
  currentPage = 0;
  showSummary = false;
  isSubmitted = false;
  isLoading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private storage: StorageService
  ) {}

  async ngOnInit() {
    const surveyId = this.route.snapshot.paramMap.get('id');
    if (!surveyId) {
      this.error = 'Survey not found';
      this.isLoading = false;
      return;
    }

    try {
      this.survey = await this.storage.getSurvey(surveyId);

      if (!this.survey) {
        this.error = 'Survey not found';
        this.isLoading = false;
        return;
      }

      if (this.survey.status !== 'published') {
        this.error = 'This survey is not currently accepting responses';
        this.isLoading = false;
        return;
      }

      this.formDef = this.survey.form;
      this.form = this.fb.group({});
      this.buildForm();
      this.isLoading = false;
    } catch {
      this.error = 'Failed to load survey';
      this.isLoading = false;
    }
  }

  private buildForm() {
    for (const page of this.formDef.pages) {
      for (const el of page.elements) {
        const q = el.question;
        const key = q.id;
        const validators = q.required ? [Validators.required] : [];

        switch (q.type) {
          case 'text':
          case 'textarea':
          case 'radio':
          case 'select':
          case 'date':
          case 'time':
            this.form.addControl(key, new FormControl('', validators));
            break;

          case 'checkbox': {
            const arr = this.fb.array([]);
            if (q.required) {
              arr.addValidators(this.minSelectedValidator(1));
            }
            this.form.addControl(key, arr);
            break;
          }

          case 'scale':
            this.form.addControl(
              key,
              new FormControl(q.scale?.min ?? 1, validators)
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

  get progressPercent(): number {
    return ((this.currentPage + 1) / this.formDef.pages.length) * 100;
  }

  private pageQuestionIds(index: number): string[] {
    return this.formDef.pages[index].elements.map((e) => e.question.id);
  }

  private validatePage(index: number): boolean {
    const ids = this.pageQuestionIds(index);
    let valid = true;
    for (const id of ids) {
      const control = this.form.get(id);
      if (control) {
        control.markAsTouched();
        control.updateValueAndValidity();
        if (control.invalid) valid = false;
      }
    }
    return valid;
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
    if (flow.nextPage === false) return this.currentPage;
    return null;
  }

  private resolveNextPageIndex(page: MWPage): number | null {
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

    return this.currentPage + 1;
  }

  next() {
    if (!this.validatePage(this.currentPage)) return;
    const page = this.formDef.pages[this.currentPage];
    const targetIndex = this.resolveNextPageIndex(page) ?? this.currentPage + 1;
    if (targetIndex < this.formDef.pages.length) {
      this.currentPage = targetIndex;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      this.showSummary = true;
    }
  }

  prev() {
    if (this.showSummary) {
      this.showSummary = false;
      return;
    }
    if (this.currentPage > 0) {
      this.currentPage--;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  async submit() {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      this.showSummary = false;
      return;
    }

    if (!this.survey) return;

    try {
      await this.storage.saveResponse(this.survey.id, this.form.value);
      this.isSubmitted = true;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      alert('Failed to submit response. Please try again.');
    }
  }

  answerLabel(qId: string, value: unknown): string {
    const q = this.formDef.pages
      .reduce(
        (acc, p) => acc.concat(p.elements),
        [] as (typeof this.formDef.pages)[0]['elements']
      )
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
      .reduce(
        (acc, p) => acc.concat(p.elements),
        [] as (typeof this.formDef.pages)[0]['elements']
      )
      .map((e) => e.question)
      .find((qq) => qq.id === qId);
    return q?.grid?.rows?.map((r) => ({ id: r.id, label: r.label })) ?? [];
  }

  gridRowValueLabel(qId: string, rowId: string): string {
    const group = this.form.get(qId) as FormGroup;
    const q = this.formDef.pages
      .reduce(
        (acc, p) => acc.concat(p.elements),
        [] as (typeof this.formDef.pages)[0]['elements']
      )
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

  goHome() {
    this.router.navigate(['/']);
  }
}
