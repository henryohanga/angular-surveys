import { Component, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MWQuestion, MWTextType } from '@angular-surveys/survey-renderer';

interface QuestionTypeOption {
  type: MWTextType;
  label: string;
  icon: string;
  description: string;
  category: 'input' | 'choice' | 'advanced' | 'media';
}

export interface QuestionDialogData {
  question?: MWQuestion;
  pageNumbers: number[];
  mode: 'create' | 'edit';
}

@Component({
  standalone: false,
  selector: 'as-question-dialog',
  templateUrl: './question-dialog.component.html',
  styleUrls: ['./question-dialog.component.scss'],
})
export class QuestionDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<QuestionDialogComponent>);
  protected readonly data = inject<QuestionDialogData>(MAT_DIALOG_DATA);

  protected form!: FormGroup;
  protected activeCategory: 'input' | 'choice' | 'advanced' | 'media' = 'input';

  protected readonly questionTypes: QuestionTypeOption[] = [
    { type: 'text', label: 'Short Text', icon: 'short_text', description: 'Single line answer', category: 'input' },
    { type: 'textarea', label: 'Long Text', icon: 'notes', description: 'Paragraph answer', category: 'input' },
    { type: 'email', label: 'Email', icon: 'email', description: 'Email address', category: 'input' },
    { type: 'phone', label: 'Phone', icon: 'phone', description: 'Phone number', category: 'input' },
    { type: 'number', label: 'Number', icon: 'pin', description: 'Numeric input', category: 'input' },
    { type: 'url', label: 'Website', icon: 'link', description: 'URL input', category: 'input' },
    { type: 'date', label: 'Date', icon: 'calendar_today', description: 'Date picker', category: 'input' },
    { type: 'time', label: 'Time', icon: 'schedule', description: 'Time picker', category: 'input' },
    { type: 'radio', label: 'Single Choice', icon: 'radio_button_checked', description: 'Select one option', category: 'choice' },
    { type: 'checkbox', label: 'Multiple Choice', icon: 'check_box', description: 'Select multiple', category: 'choice' },
    { type: 'select', label: 'Dropdown', icon: 'arrow_drop_down_circle', description: 'Dropdown list', category: 'choice' },
    { type: 'scale', label: 'Linear Scale', icon: 'linear_scale', description: 'Scale rating', category: 'advanced' },
    { type: 'rating', label: 'Star Rating', icon: 'star', description: '5-star rating', category: 'advanced' },
    { type: 'nps', label: 'NPS Score', icon: 'speed', description: '0-10 score', category: 'advanced' },
    { type: 'grid', label: 'Matrix Grid', icon: 'grid_on', description: 'Grid questions', category: 'advanced' },
    { type: 'priority', label: 'Ranking', icon: 'format_list_numbered', description: 'Rank items', category: 'advanced' },
    { type: 'file', label: 'File Upload', icon: 'cloud_upload', description: 'Upload files', category: 'media' },
    { type: 'signature', label: 'Signature', icon: 'gesture', description: 'Draw signature', category: 'media' },
  ];

  categories = [
    { id: 'input', label: 'Input', icon: 'text_fields' },
    { id: 'choice', label: 'Choice', icon: 'checklist' },
    { id: 'advanced', label: 'Advanced', icon: 'tune' },
    { id: 'media', label: 'Media', icon: 'perm_media' },
  ];

  fileTypeOptions = [
    { value: 'image/*', label: 'Images', icon: 'image' },
    { value: 'video/*', label: 'Videos', icon: 'videocam' },
    { value: 'audio/*', label: 'Audio', icon: 'mic' },
    { value: '.pdf', label: 'PDF', icon: 'picture_as_pdf' },
    { value: '.doc,.docx', label: 'Documents', icon: 'description' },
  ];

  ngOnInit(): void {
    this.initForm();
    if (this.data.question) {
      this.loadQuestion(this.data.question);
    } else {
      this.form.patchValue({ id: 'q-' + Date.now() });
    }
  }

  initForm(): void {
    this.form = this.fb.group({
      id: ['', Validators.required],
      text: ['', Validators.required],
      type: ['text'],
      required: [false],
      placeholder: [''],
      pageFlowModifier: [false],
      otherAnswer: [false],
      externalId: [''],
      externalFieldName: [''],
      offeredAnswers: this.fb.array([]),
      grid: this.fb.group({
        cellInputType: ['radio'],
        rows: this.fb.array([]),
        cols: this.fb.array([]),
      }),
      priorityList: this.fb.array([]),
      scale: this.fb.group({ min: [1], max: [5], step: [1], minLabel: [''], maxLabel: [''] }),
      fileConfig: this.fb.group({ accept: [['image/*']], maxSize: [10], multiple: [false] }),
      numberConfig: this.fb.group({ min: [null], max: [null], step: [1], prefix: [''], suffix: [''] }),
    });
  }

  loadQuestion(q: MWQuestion): void {
    this.form.patchValue({
      id: q.id, text: q.text, type: q.type, required: !!q.required,
      placeholder: q.placeholder || '', pageFlowModifier: !!q.pageFlowModifier,
      otherAnswer: !!q.otherAnswer,
      externalId: (q as unknown as Record<string, unknown>)['externalId'] || '',
      externalFieldName: (q as unknown as Record<string, unknown>)['externalFieldName'] || '',
    });

    const typeInfo = this.questionTypes.find((t) => t.type === q.type);
    if (typeInfo) this.activeCategory = typeInfo.category;

    this.offeredAnswers.clear();
    if (q.offeredAnswers) {
      q.offeredAnswers.forEach((a, idx) => {
        this.offeredAnswers.push(
          this.createAnswerGroup(a.id, idx + 1, a.value, a.pageFlow?.goToPage)
        );
      });
    }

    if (q.grid) {
      this.grid.patchValue({ cellInputType: q.grid.cellInputType });
      this.gridRows.clear();
      this.gridCols.clear();
      q.grid.rows.forEach((r, idx) => this.gridRows.push(this.createGridItemGroup(r.id, idx + 1, r.label)));
      q.grid.cols.forEach((c, idx) => this.gridCols.push(this.createGridItemGroup(c.id, idx + 1, c.label)));
    }

    this.priorityList.clear();
    if (q.priorityList) {
      q.priorityList.forEach((p, idx) => this.priorityList.push(this.createPriorityGroup(p.id, idx + 1, p.value)));
    }

    if (q.scale) this.scale.patchValue(q.scale);
    if (q.fileConfig) this.fileConfig.patchValue(q.fileConfig);
    if (q.numberConfig) this.numberConfig.patchValue(q.numberConfig);
  }

  get offeredAnswers(): FormArray { return this.form.get('offeredAnswers') as FormArray; }
  get grid(): FormGroup { return this.form.get('grid') as FormGroup; }
  get gridRows(): FormArray { return this.grid.get('rows') as FormArray; }
  get gridCols(): FormArray { return this.grid.get('cols') as FormArray; }
  get priorityList(): FormArray { return this.form.get('priorityList') as FormArray; }
  get scale(): FormGroup { return this.form.get('scale') as FormGroup; }
  get fileConfig(): FormGroup { return this.form.get('fileConfig') as FormGroup; }
  get numberConfig(): FormGroup { return this.form.get('numberConfig') as FormGroup; }
  get currentType(): MWTextType { return this.form.get('type')?.value as MWTextType; }
  get showOptions(): boolean { return ['radio', 'checkbox', 'select'].includes(this.currentType); }
  get showScale(): boolean { return this.currentType === 'scale'; }
  get showRating(): boolean { return this.currentType === 'rating'; }
  get showNps(): boolean { return this.currentType === 'nps'; }
  get showGrid(): boolean { return this.currentType === 'grid'; }
  get showPriority(): boolean { return this.currentType === 'priority'; }
  get showFile(): boolean { return this.currentType === 'file'; }
  get showNumber(): boolean { return this.currentType === 'number'; }
  get showPlaceholder(): boolean { return ['text', 'textarea', 'email', 'phone', 'number', 'url'].includes(this.currentType); }
  get filteredTypes(): QuestionTypeOption[] { return this.questionTypes.filter((t) => t.category === this.activeCategory); }
  get showPageFlow(): boolean { return ['radio', 'select'].includes(this.currentType) && this.data.pageNumbers.length > 1; }

  createAnswerGroup(id: string, orderNo: number, value = '', goToPage?: number): FormGroup {
    return this.fb.group({
      id: [id], orderNo: [orderNo], value: [value],
      pageFlow: this.fb.group({ goToPage: [goToPage || null] }),
    });
  }

  createGridItemGroup(id: string, orderNo: number, label = ''): FormGroup {
    return this.fb.group({ id: [id], orderNo: [orderNo], label: [label] });
  }

  createPriorityGroup(id: string, orderNo: number, value = ''): FormGroup {
    return this.fb.group({ id: [id], orderNo: [orderNo], value: [value] });
  }

  selectCategory(category: 'input' | 'choice' | 'advanced' | 'media'): void {
    this.activeCategory = category;
  }

  selectType(type: MWTextType): void {
    this.form.patchValue({ type });
    this.initializeTypeDefaults(type);
  }

  initializeTypeDefaults(type: MWTextType): void {
    if (['radio', 'checkbox', 'select'].includes(type) && this.offeredAnswers.length === 0) {
      this.addAnswer(); this.addAnswer(); this.addAnswer();
    }
    if (type === 'grid' && this.gridRows.length === 0) {
      this.addGridRow(); this.addGridRow();
      this.addGridCol(); this.addGridCol(); this.addGridCol();
    }
    if (type === 'priority' && this.priorityList.length === 0) {
      this.addPriorityItem(); this.addPriorityItem(); this.addPriorityItem();
    }
    if (type === 'nps') this.scale.patchValue({ min: 0, max: 10, step: 1, minLabel: 'Not likely', maxLabel: 'Very likely' });
    if (type === 'rating') this.scale.patchValue({ min: 1, max: 5, step: 1 });
  }

  addAnswer(): void {
    const i = this.offeredAnswers.length + 1;
    this.offeredAnswers.push(this.createAnswerGroup('opt-' + i + '-' + Date.now(), i, ''));
  }

  removeAnswer(i: number): void { this.offeredAnswers.removeAt(i); }

  dropOption(event: { previousIndex: number; currentIndex: number }): void {
    const c = this.offeredAnswers.controls;
    const [item] = c.splice(event.previousIndex, 1);
    c.splice(event.currentIndex, 0, item);
  }

  addGridRow(): void {
    const i = this.gridRows.length + 1;
    this.gridRows.push(this.createGridItemGroup('row-' + i + '-' + Date.now(), i, ''));
  }

  removeGridRow(i: number): void { this.gridRows.removeAt(i); }

  addGridCol(): void {
    const i = this.gridCols.length + 1;
    this.gridCols.push(this.createGridItemGroup('col-' + i + '-' + Date.now(), i, ''));
  }

  removeGridCol(i: number): void { this.gridCols.removeAt(i); }

  addPriorityItem(): void {
    const i = this.priorityList.length + 1;
    this.priorityList.push(this.createPriorityGroup('p' + i + '-' + Date.now(), i, ''));
  }

  removePriorityItem(i: number): void { this.priorityList.removeAt(i); }

  dropPriority(event: { previousIndex: number; currentIndex: number }): void {
    const c = this.priorityList.controls;
    const [item] = c.splice(event.previousIndex, 1);
    c.splice(event.currentIndex, 0, item);
  }

  toggleFileType(type: string): void {
    const current: string[] = [...(this.fileConfig.get('accept')?.value || [])];
    const idx = current.indexOf(type);
    if (idx > -1) current.splice(idx, 1); else current.push(type);
    this.fileConfig.patchValue({ accept: current });
  }

  isFileTypeSelected(type: string): boolean {
    return ((this.fileConfig.get('accept')?.value || []) as string[]).includes(type);
  }

  getScalePreview(): number[] {
    const min = (this.scale.get('min')?.value as number) || 1;
    const max = (this.scale.get('max')?.value as number) || 5;
    const range: number[] = [];
    for (let i = min; i <= max && range.length < 11; i++) range.push(i);
    return range;
  }

  getRatingStars(): number[] {
    const max = (this.scale.get('max')?.value as number) || 5;
    return Array.from({ length: max }, (_, i) => i + 1);
  }

  isFormValid(): boolean {
    return !!(this.form.get('text')?.value?.trim()) && !!(this.form.get('id')?.value?.trim());
  }

  save(): void {
    if (this.isFormValid()) this.dialogRef.close(this.buildQuestion());
  }

  buildQuestion(): MWQuestion {
    const v = this.form.value as Record<string, unknown>;
    const q: MWQuestion = {
      id: v['id'] as string,
      text: v['text'] as string,
      type: v['type'] as MWTextType,
      required: v['required'] as boolean,
    };
    if (this.showPlaceholder && v['placeholder']) q.placeholder = v['placeholder'] as string;
    if (this.showOptions && this.offeredAnswers.length > 0) {
      const answers = v['offeredAnswers'] as Array<{ id: string; orderNo: number; value: string; pageFlow?: { goToPage: number | null } }>;
      q.offeredAnswers = answers
        .filter((a) => a.value?.trim())
        .map((a) => ({
          id: a.id, orderNo: a.orderNo, value: a.value,
          ...(a.pageFlow?.goToPage ? { pageFlow: { goToPage: a.pageFlow.goToPage } } : {}),
        }));
      q.otherAnswer = v['otherAnswer'] as boolean;
      q.pageFlowModifier = q.offeredAnswers?.some((a) => (a as { pageFlow?: { goToPage?: number } }).pageFlow?.goToPage) ?? false;
    }
    if (this.showScale || this.showRating || this.showNps) q.scale = v['scale'] as MWQuestion['scale'];
    if (this.showGrid) {
      const g = v['grid'] as { cellInputType: 'radio' | 'checkbox'; rows: Array<{ id: string; orderNo: number; label: string }>; cols: Array<{ id: string; orderNo: number; label: string }> };
      q.grid = {
        cellInputType: g.cellInputType,
        rows: g.rows.filter((r) => r.label?.trim()),
        cols: g.cols.filter((c) => c.label?.trim()),
      };
    }
    if (this.showPriority) {
      const pl = v['priorityList'] as Array<{ id: string; orderNo: number; value: string }>;
      q.priorityList = pl.filter((p) => p.value?.trim());
    }
    if (this.showFile) q.fileConfig = v['fileConfig'] as MWQuestion['fileConfig'];
    if (this.showNumber) q.numberConfig = v['numberConfig'] as MWQuestion['numberConfig'];
    return q;
  }

  cancel(): void { this.dialogRef.close(); }
}
