import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MWQuestion, MWTextType } from '../surveys/models';

interface QuestionTypeOption {
  type: MWTextType;
  label: string;
  icon: string;
  description: string;
}

export interface QuestionDialogData {
  question?: MWQuestion;
  pageNumbers: number[];
  mode: 'create' | 'edit';
}

@Component({
  selector: 'app-question-dialog',
  template: `
    <div class="question-dialog">
      <div class="dialog-header">
        <h2>{{ data.mode === 'edit' ? 'Edit Question' : 'Add Question' }}</h2>
        <button mat-icon-button (click)="cancel()" aria-label="Close">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="dialog-content">
        <form [formGroup]="form">
          <!-- Question Text -->
          <div class="form-section">
            <label class="section-label"
              >Question Text <span class="required">*</span></label
            >
            <mat-form-field appearance="outline" class="full-width">
              <textarea
                matInput
                formControlName="text"
                placeholder="Enter your question..."
                rows="2"
                cdkTextareaAutosize
              ></textarea>
              <mat-error *ngIf="form.get('text')?.hasError('required')">
                Question text is required
              </mat-error>
            </mat-form-field>
          </div>

          <!-- Question Type Selector -->
          <div class="form-section">
            <label class="section-label">Question Type</label>
            <div class="type-grid">
              <button
                type="button"
                *ngFor="let qtype of questionTypes"
                class="type-option"
                [class.selected]="form.get('type')?.value === qtype.type"
                (click)="selectType(qtype.type)"
              >
                <mat-icon>{{ qtype.icon }}</mat-icon>
                <span class="type-label">{{ qtype.label }}</span>
              </button>
            </div>
          </div>

          <!-- Options Section (for radio, checkbox, select) -->
          <div class="form-section" *ngIf="showOptions">
            <div class="section-header">
              <label class="section-label">Options</label>
              <button
                mat-button
                type="button"
                (click)="addAnswer()"
                class="add-btn"
              >
                <mat-icon>add</mat-icon> Add Option
              </button>
            </div>
            <div
              formArrayName="offeredAnswers"
              class="options-list"
              cdkDropList
              (cdkDropListDropped)="dropOption($event)"
            >
              <div
                *ngFor="let a of offeredAnswers.controls; let i = index"
                [formGroupName]="i"
                class="option-item"
                cdkDrag
              >
                <mat-icon class="drag-handle" cdkDragHandle
                  >drag_indicator</mat-icon
                >
                <span class="option-number">{{ i + 1 }}</span>
                <input
                  class="option-input"
                  formControlName="value"
                  placeholder="Option {{ i + 1 }}"
                />
                <button
                  mat-icon-button
                  type="button"
                  (click)="removeAnswer(i)"
                  class="remove-btn"
                  [disabled]="offeredAnswers.length <= 1"
                  aria-label="Remove option"
                >
                  <mat-icon>close</mat-icon>
                </button>
              </div>
            </div>
            <mat-checkbox formControlName="otherAnswer" class="other-checkbox">
              Add "Other" option
            </mat-checkbox>
          </div>

          <!-- Scale Options -->
          <div
            class="form-section"
            *ngIf="form.get('type')?.value === 'scale'"
            [formGroup]="scale"
          >
            <label class="section-label">Scale Settings</label>
            <div class="scale-config">
              <div class="scale-range">
                <mat-form-field appearance="outline">
                  <mat-label>From</mat-label>
                  <input matInput type="number" formControlName="min" />
                </mat-form-field>
                <span class="range-separator">to</span>
                <mat-form-field appearance="outline">
                  <mat-label>To</mat-label>
                  <input matInput type="number" formControlName="max" />
                </mat-form-field>
              </div>
              <div class="scale-labels">
                <mat-form-field appearance="outline">
                  <mat-label>Low label (optional)</mat-label>
                  <input
                    matInput
                    formControlName="minLabel"
                    placeholder="e.g., Poor"
                  />
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>High label (optional)</mat-label>
                  <input
                    matInput
                    formControlName="maxLabel"
                    placeholder="e.g., Excellent"
                  />
                </mat-form-field>
              </div>
            </div>
            <div class="scale-preview">
              <span class="scale-preview-label">{{
                scale.get('minLabel')?.value || scale.get('min')?.value
              }}</span>
              <div class="scale-preview-dots">
                <span *ngFor="let n of getScalePreview()" class="preview-dot">{{
                  n
                }}</span>
              </div>
              <span class="scale-preview-label">{{
                scale.get('maxLabel')?.value || scale.get('max')?.value
              }}</span>
            </div>
          </div>

          <!-- Grid Options -->
          <div
            class="form-section"
            *ngIf="form.get('type')?.value === 'grid'"
            [formGroup]="grid"
          >
            <label class="section-label">Grid Configuration</label>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Selection Type</mat-label>
              <mat-select formControlName="cellInputType">
                <mat-option value="radio">Single choice per row</mat-option>
                <mat-option value="checkbox"
                  >Multiple choices per row</mat-option
                >
              </mat-select>
            </mat-form-field>

            <div class="grid-config">
              <div class="grid-column">
                <div class="grid-header">
                  <span>Rows</span>
                  <button
                    mat-button
                    type="button"
                    (click)="addGridRow()"
                    class="add-btn small"
                  >
                    <mat-icon>add</mat-icon>
                  </button>
                </div>
                <div formArrayName="rows" class="grid-items">
                  <div
                    *ngFor="let r of gridRows.controls; let i = index"
                    [formGroupName]="i"
                    class="grid-item"
                  >
                    <input
                      class="grid-input"
                      formControlName="label"
                      placeholder="Row {{ i + 1 }}"
                    />
                    <button
                      mat-icon-button
                      type="button"
                      (click)="removeGridRow(i)"
                      [disabled]="gridRows.length <= 1"
                    >
                      <mat-icon>close</mat-icon>
                    </button>
                  </div>
                </div>
              </div>
              <div class="grid-column">
                <div class="grid-header">
                  <span>Columns</span>
                  <button
                    mat-button
                    type="button"
                    (click)="addGridCol()"
                    class="add-btn small"
                  >
                    <mat-icon>add</mat-icon>
                  </button>
                </div>
                <div formArrayName="cols" class="grid-items">
                  <div
                    *ngFor="let c of gridCols.controls; let i = index"
                    [formGroupName]="i"
                    class="grid-item"
                  >
                    <input
                      class="grid-input"
                      formControlName="label"
                      placeholder="Column {{ i + 1 }}"
                    />
                    <button
                      mat-icon-button
                      type="button"
                      (click)="removeGridCol(i)"
                      [disabled]="gridCols.length <= 1"
                    >
                      <mat-icon>close</mat-icon>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Priority/Ranking Items -->
          <div
            class="form-section"
            *ngIf="form.get('type')?.value === 'priority'"
          >
            <div class="section-header">
              <label class="section-label">Items to Rank</label>
              <button
                mat-button
                type="button"
                (click)="addPriorityItem()"
                class="add-btn"
              >
                <mat-icon>add</mat-icon> Add Item
              </button>
            </div>
            <div
              formArrayName="priorityList"
              class="options-list"
              cdkDropList
              (cdkDropListDropped)="dropPriority($event)"
            >
              <div
                *ngFor="let it of priorityList.controls; let i = index"
                [formGroupName]="i"
                class="option-item"
                cdkDrag
              >
                <mat-icon class="drag-handle" cdkDragHandle
                  >drag_indicator</mat-icon
                >
                <span class="option-number">{{ i + 1 }}</span>
                <input
                  class="option-input"
                  formControlName="value"
                  placeholder="Item {{ i + 1 }}"
                />
                <button
                  mat-icon-button
                  type="button"
                  (click)="removePriorityItem(i)"
                  class="remove-btn"
                  [disabled]="priorityList.length <= 2"
                >
                  <mat-icon>close</mat-icon>
                </button>
              </div>
            </div>
          </div>

          <!-- Required Toggle -->
          <div class="form-section required-section">
            <mat-slide-toggle formControlName="required" color="primary">
              Required question
            </mat-slide-toggle>
            <span class="required-hint"
              >Respondents must answer this question</span
            >
          </div>
        </form>
      </div>

      <div class="dialog-actions">
        <button mat-button (click)="cancel()">Cancel</button>
        <button
          mat-raised-button
          color="primary"
          (click)="save()"
          [disabled]="!form.valid"
        >
          {{ data.mode === 'edit' ? 'Save Changes' : 'Add Question' }}
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .question-dialog {
        width: 600px;
        max-width: 100vw;
      }

      .dialog-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 24px;
        border-bottom: 1px solid var(--surface-border);
      }

      .dialog-header h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
      }

      .dialog-content {
        padding: 24px;
        max-height: 60vh;
        overflow-y: auto;
      }

      .form-section {
        margin-bottom: 24px;
      }

      .section-label {
        display: block;
        font-size: 13px;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 8px;
      }

      .section-label .required {
        color: var(--danger);
      }

      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      }

      .section-header .section-label {
        margin-bottom: 0;
      }

      .full-width {
        width: 100%;
      }

      /* Type Grid */
      .type-grid {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 8px;
      }

      .type-option {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 12px 8px;
        border: 2px solid var(--surface-border);
        border-radius: 8px;
        background: var(--surface);
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .type-option:hover {
        border-color: var(--primary);
        background: var(--primary-ghost);
      }

      .type-option.selected {
        border-color: var(--primary);
        background: var(--primary-ghost);
      }

      .type-option.selected mat-icon {
        color: var(--primary);
      }

      .type-option mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
        color: var(--text-secondary);
      }

      .type-label {
        font-size: 11px;
        font-weight: 500;
        color: var(--text-primary);
        text-align: center;
      }

      /* Options List */
      .options-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 12px;
      }

      .option-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background: var(--supporting);
        border-radius: 6px;
        border: 1px solid var(--surface-border);
      }

      .option-item.cdk-drag-preview {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .drag-handle {
        cursor: grab;
        color: var(--text-secondary);
        font-size: 18px;
      }

      .drag-handle:active {
        cursor: grabbing;
      }

      .option-number {
        font-size: 12px;
        font-weight: 600;
        color: var(--text-secondary);
        min-width: 20px;
      }

      .option-input {
        flex: 1;
        border: none;
        background: transparent;
        font-size: 14px;
        padding: 4px 0;
        outline: none;
        color: var(--text-primary);
      }

      .option-input:focus {
        border-bottom: 1px solid var(--primary);
      }

      .remove-btn {
        opacity: 0.5;
      }

      .remove-btn:hover:not(:disabled) {
        opacity: 1;
        color: var(--danger);
      }

      .other-checkbox {
        font-size: 13px;
      }

      .add-btn {
        font-size: 13px;
      }

      .add-btn.small {
        min-width: auto;
        padding: 0 8px;
      }

      /* Scale Config */
      .scale-config {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .scale-range {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .scale-range mat-form-field {
        width: 100px;
      }

      .range-separator {
        color: var(--text-secondary);
      }

      .scale-labels {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }

      .scale-preview {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        background: var(--supporting);
        border-radius: 8px;
        margin-top: 12px;
      }

      .scale-preview-label {
        font-size: 12px;
        color: var(--text-secondary);
        min-width: 60px;
      }

      .scale-preview-dots {
        display: flex;
        gap: 8px;
        flex: 1;
        justify-content: center;
      }

      .preview-dot {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid var(--surface-border);
        border-radius: 50%;
        font-size: 12px;
        font-weight: 600;
        color: var(--text-primary);
      }

      /* Grid Config */
      .grid-config {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
      }

      .grid-column {
        display: flex;
        flex-direction: column;
      }

      .grid-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 12px;
        font-weight: 600;
        color: var(--text-secondary);
        text-transform: uppercase;
      }

      .grid-items {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .grid-item {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .grid-input {
        flex: 1;
        padding: 8px 12px;
        border: 1px solid var(--surface-border);
        border-radius: 4px;
        font-size: 13px;
        background: var(--surface);
      }

      .grid-input:focus {
        outline: none;
        border-color: var(--primary);
      }

      /* Required Section */
      .required-section {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        background: var(--supporting);
        border-radius: 8px;
      }

      .required-hint {
        font-size: 12px;
        color: var(--text-secondary);
      }

      /* Dialog Actions */
      .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        padding: 16px 24px;
        border-top: 1px solid var(--surface-border);
      }

      @media (max-width: 640px) {
        .type-grid {
          grid-template-columns: repeat(3, 1fr);
        }

        .scale-labels,
        .grid-config {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class QuestionDialogComponent implements OnInit {
  form: FormGroup;

  questionTypes: QuestionTypeOption[] = [
    {
      type: 'text',
      label: 'Short Text',
      icon: 'text_fields',
      description: 'Single line',
    },
    {
      type: 'textarea',
      label: 'Long Text',
      icon: 'notes',
      description: 'Paragraph',
    },
    {
      type: 'radio',
      label: 'Choice',
      icon: 'radio_button_checked',
      description: 'Single select',
    },
    {
      type: 'checkbox',
      label: 'Checkboxes',
      icon: 'check_box',
      description: 'Multi select',
    },
    {
      type: 'select',
      label: 'Dropdown',
      icon: 'arrow_drop_down_circle',
      description: 'Dropdown',
    },
    { type: 'scale', label: 'Rating', icon: 'star', description: 'Scale' },
    {
      type: 'date',
      label: 'Date',
      icon: 'calendar_today',
      description: 'Date picker',
    },
    {
      type: 'time',
      label: 'Time',
      icon: 'schedule',
      description: 'Time picker',
    },
    { type: 'grid', label: 'Grid', icon: 'grid_on', description: 'Matrix' },
    {
      type: 'priority',
      label: 'Ranking',
      icon: 'format_list_numbered',
      description: 'Rank items',
    },
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<QuestionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: QuestionDialogData
  ) {
    this.form = this.fb.group({
      id: [''],
      text: ['', Validators.required],
      type: ['text', Validators.required],
      required: [false],
      pageFlowModifier: [false],
      otherAnswer: [false],
      offeredAnswers: this.fb.array([]),
      grid: this.fb.group({
        cellInputType: ['radio'],
        rows: this.fb.array([]),
        cols: this.fb.array([]),
      }),
      priorityList: this.fb.array([]),
      scale: this.fb.group({
        min: [1, [Validators.required, Validators.min(0), Validators.max(100)]],
        max: [5, [Validators.required, Validators.min(1), Validators.max(100)]],
        step: [1, [Validators.required, Validators.min(1)]],
        minLabel: ['', Validators.maxLength(50)],
        maxLabel: ['', Validators.maxLength(50)],
      }),
    });
  }

  ngOnInit() {
    if (this.data.question) {
      this.loadQuestion(this.data.question);
    } else {
      this.form.patchValue({ id: 'q-' + Date.now() });
      // Add default options for choice types
      this.addAnswer();
      this.addAnswer();
    }
  }

  loadQuestion(q: MWQuestion) {
    this.form.patchValue({
      id: q.id,
      text: q.text,
      type: q.type,
      required: !!q.required,
      pageFlowModifier: !!q.pageFlowModifier,
      otherAnswer: !!q.otherAnswer,
    });

    // Load options
    this.offeredAnswers.clear();
    if (q.offeredAnswers) {
      q.offeredAnswers.forEach((a, idx) => {
        this.offeredAnswers.push(
          this.fb.group({
            id: a.id,
            orderNo: idx + 1,
            value: a.value,
            pageFlow: this.fb.group({
              nextPage: [!!a.pageFlow?.nextPage],
              goToPage: [a.pageFlow?.goToPage ?? null],
              label: [a.pageFlow?.label ?? ''],
            }),
          })
        );
      });
    }

    // Load grid
    if (q.grid) {
      this.grid.patchValue({ cellInputType: q.grid.cellInputType });
      this.gridRows.clear();
      this.gridCols.clear();
      q.grid.rows.forEach((r, idx) => {
        this.gridRows.push(
          this.fb.group({ id: r.id, orderNo: idx + 1, label: r.label })
        );
      });
      q.grid.cols.forEach((c, idx) => {
        this.gridCols.push(
          this.fb.group({ id: c.id, orderNo: idx + 1, label: c.label })
        );
      });
    }

    // Load priority
    this.priorityList.clear();
    if (q.priorityList) {
      q.priorityList.forEach((it, idx) => {
        this.priorityList.push(
          this.fb.group({ id: it.id, orderNo: idx + 1, value: it.value })
        );
      });
    }

    // Load scale
    if (q.scale) {
      this.scale.patchValue({
        min: q.scale.min,
        max: q.scale.max,
        step: q.scale.step ?? 1,
        minLabel: q.scale.minLabel ?? '',
        maxLabel: q.scale.maxLabel ?? '',
      });
    }
  }

  get showOptions(): boolean {
    const type = this.form.get('type')?.value;
    return ['radio', 'checkbox', 'select'].includes(type);
  }

  get offeredAnswers(): FormArray {
    return this.form.get('offeredAnswers') as FormArray;
  }

  get grid(): FormGroup {
    return this.form.get('grid') as FormGroup;
  }

  get gridRows(): FormArray {
    return this.grid.get('rows') as FormArray;
  }

  get gridCols(): FormArray {
    return this.grid.get('cols') as FormArray;
  }

  get priorityList(): FormArray {
    return this.form.get('priorityList') as FormArray;
  }

  get scale(): FormGroup {
    return this.form.get('scale') as FormGroup;
  }

  selectType(type: MWTextType) {
    this.form.patchValue({ type });

    // Initialize defaults when switching types
    if (
      ['radio', 'checkbox', 'select'].includes(type) &&
      this.offeredAnswers.length === 0
    ) {
      this.addAnswer();
      this.addAnswer();
    }

    if (type === 'grid' && this.gridRows.length === 0) {
      this.addGridRow();
      this.addGridRow();
      this.addGridCol();
      this.addGridCol();
      this.addGridCol();
    }

    if (type === 'priority' && this.priorityList.length === 0) {
      this.addPriorityItem();
      this.addPriorityItem();
      this.addPriorityItem();
    }
  }

  addAnswer() {
    const index = this.offeredAnswers.length + 1;
    this.offeredAnswers.push(
      this.fb.group({
        id: 'opt-' + index + '-' + Date.now(),
        orderNo: index,
        value: ['', [Validators.required, Validators.maxLength(200)]],
        pageFlow: this.fb.group({
          nextPage: [false],
          goToPage: [null],
          label: [''],
        }),
      })
    );
  }

  removeAnswer(i: number) {
    this.offeredAnswers.removeAt(i);
  }

  dropOption(event: { previousIndex: number; currentIndex: number }) {
    const controls = this.offeredAnswers.controls;
    const item = controls[event.previousIndex];
    controls.splice(event.previousIndex, 1);
    controls.splice(event.currentIndex, 0, item);
  }

  addGridRow() {
    const index = this.gridRows.length + 1;
    this.gridRows.push(
      this.fb.group({
        id: 'row-' + index + '-' + Date.now(),
        orderNo: index,
        label: ['', [Validators.required, Validators.maxLength(100)]],
      })
    );
  }

  removeGridRow(i: number) {
    this.gridRows.removeAt(i);
  }

  addGridCol() {
    const index = this.gridCols.length + 1;
    this.gridCols.push(
      this.fb.group({
        id: 'col-' + index + '-' + Date.now(),
        orderNo: index,
        label: ['', [Validators.required, Validators.maxLength(100)]],
      })
    );
  }

  removeGridCol(i: number) {
    this.gridCols.removeAt(i);
  }

  addPriorityItem() {
    const index = this.priorityList.length + 1;
    this.priorityList.push(
      this.fb.group({
        id: 'p' + index + '-' + Date.now(),
        orderNo: index,
        value: ['', [Validators.required, Validators.maxLength(200)]],
      })
    );
  }

  removePriorityItem(i: number) {
    this.priorityList.removeAt(i);
  }

  dropPriority(event: { previousIndex: number; currentIndex: number }) {
    const controls = this.priorityList.controls;
    const item = controls[event.previousIndex];
    controls.splice(event.previousIndex, 1);
    controls.splice(event.currentIndex, 0, item);
  }

  getScalePreview(): number[] {
    const min = this.scale.get('min')?.value || 1;
    const max = this.scale.get('max')?.value || 5;
    const range: number[] = [];
    for (let i = min; i <= max && range.length < 10; i++) {
      range.push(i);
    }
    return range;
  }

  save() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value as MWQuestion);
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}
