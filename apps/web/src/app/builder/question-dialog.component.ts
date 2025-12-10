import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MWQuestion, MWTextType } from '../surveys/models';

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

@Component({ standalone: false,
  selector: 'app-question-dialog',
  templateUrl: './question-dialog.component.html',
  styleUrls: ['./question-dialog.component.scss'],
})
export class QuestionDialogComponent implements OnInit {
  form!: FormGroup;
  activeCategory: 'input' | 'choice' | 'advanced' | 'media' = 'input';

  questionTypes: QuestionTypeOption[] = [
    // Input types
    {
      type: 'text',
      label: 'Short Text',
      icon: 'short_text',
      description: 'Single line answer',
      category: 'input',
    },
    {
      type: 'textarea',
      label: 'Long Text',
      icon: 'notes',
      description: 'Paragraph answer',
      category: 'input',
    },
    {
      type: 'email',
      label: 'Email',
      icon: 'email',
      description: 'Email address',
      category: 'input',
    },
    {
      type: 'phone',
      label: 'Phone',
      icon: 'phone',
      description: 'Phone number',
      category: 'input',
    },
    {
      type: 'number',
      label: 'Number',
      icon: 'pin',
      description: 'Numeric input',
      category: 'input',
    },
    {
      type: 'url',
      label: 'Website',
      icon: 'link',
      description: 'URL input',
      category: 'input',
    },
    {
      type: 'date',
      label: 'Date',
      icon: 'calendar_today',
      description: 'Date picker',
      category: 'input',
    },
    {
      type: 'time',
      label: 'Time',
      icon: 'schedule',
      description: 'Time picker',
      category: 'input',
    },
    // Choice types
    {
      type: 'radio',
      label: 'Single Choice',
      icon: 'radio_button_checked',
      description: 'Select one option',
      category: 'choice',
    },
    {
      type: 'checkbox',
      label: 'Multiple Choice',
      icon: 'check_box',
      description: 'Select multiple',
      category: 'choice',
    },
    {
      type: 'select',
      label: 'Dropdown',
      icon: 'arrow_drop_down_circle',
      description: 'Dropdown list',
      category: 'choice',
    },
    // Advanced types
    {
      type: 'scale',
      label: 'Linear Scale',
      icon: 'linear_scale',
      description: 'Scale rating',
      category: 'advanced',
    },
    {
      type: 'rating',
      label: 'Star Rating',
      icon: 'star',
      description: '5-star rating',
      category: 'advanced',
    },
    {
      type: 'nps',
      label: 'NPS Score',
      icon: 'speed',
      description: '0-10 score',
      category: 'advanced',
    },
    {
      type: 'grid',
      label: 'Matrix Grid',
      icon: 'grid_on',
      description: 'Grid questions',
      category: 'advanced',
    },
    {
      type: 'priority',
      label: 'Ranking',
      icon: 'format_list_numbered',
      description: 'Rank items',
      category: 'advanced',
    },
    // Media types
    {
      type: 'file',
      label: 'File Upload',
      icon: 'cloud_upload',
      description: 'Upload files',
      category: 'media',
    },
    {
      type: 'signature',
      label: 'Signature',
      icon: 'gesture',
      description: 'Draw signature',
      category: 'media',
    },
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

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<QuestionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: QuestionDialogData
  ) {}

  ngOnInit() {
    this.initForm();
    if (this.data.question) {
      this.loadQuestion(this.data.question);
    } else {
      this.form.patchValue({ id: 'q-' + Date.now() });
    }
  }

  initForm() {
    this.form = this.fb.group({
      id: ['', Validators.required],
      text: ['', Validators.required],
      type: ['text'],
      required: [false],
      placeholder: [''],
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
        min: [1],
        max: [5],
        step: [1],
        minLabel: [''],
        maxLabel: [''],
      }),
      fileConfig: this.fb.group({
        accept: [['image/*']],
        maxSize: [10],
        multiple: [false],
      }),
      numberConfig: this.fb.group({
        min: [null],
        max: [null],
        step: [1],
        prefix: [''],
        suffix: [''],
      }),
    });
  }

  loadQuestion(q: MWQuestion) {
    this.form.patchValue({
      id: q.id,
      text: q.text,
      type: q.type,
      required: !!q.required,
      placeholder: q.placeholder || '',
      pageFlowModifier: !!q.pageFlowModifier,
      otherAnswer: !!q.otherAnswer,
    });

    // Set active category based on type
    const typeInfo = this.questionTypes.find((t) => t.type === q.type);
    if (typeInfo) {
      this.activeCategory = typeInfo.category;
    }

    // Load options
    this.offeredAnswers.clear();
    if (q.offeredAnswers) {
      q.offeredAnswers.forEach((a, idx) => {
        this.offeredAnswers.push(
          this.createAnswerGroup(a.id, idx + 1, a.value)
        );
      });
    }

    // Load grid
    if (q.grid) {
      this.grid.patchValue({ cellInputType: q.grid.cellInputType });
      this.gridRows.clear();
      this.gridCols.clear();
      q.grid.rows.forEach((r, idx) => {
        this.gridRows.push(this.createGridItemGroup(r.id, idx + 1, r.label));
      });
      q.grid.cols.forEach((c, idx) => {
        this.gridCols.push(this.createGridItemGroup(c.id, idx + 1, c.label));
      });
    }

    // Load priority list
    this.priorityList.clear();
    if (q.priorityList) {
      q.priorityList.forEach((p, idx) => {
        this.priorityList.push(
          this.createPriorityGroup(p.id, idx + 1, p.value)
        );
      });
    }

    // Load scale
    if (q.scale) {
      this.scale.patchValue(q.scale);
    }

    // Load file config
    if (q.fileConfig) {
      this.fileConfig.patchValue(q.fileConfig);
    }

    // Load number config
    if (q.numberConfig) {
      this.numberConfig.patchValue(q.numberConfig);
    }
  }

  // Form getters
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

  get fileConfig(): FormGroup {
    return this.form.get('fileConfig') as FormGroup;
  }

  get numberConfig(): FormGroup {
    return this.form.get('numberConfig') as FormGroup;
  }

  get currentType(): MWTextType {
    return this.form.get('type')?.value;
  }

  get showOptions(): boolean {
    return ['radio', 'checkbox', 'select'].includes(this.currentType);
  }

  get showScale(): boolean {
    return this.currentType === 'scale';
  }

  get showRating(): boolean {
    return this.currentType === 'rating';
  }

  get showNps(): boolean {
    return this.currentType === 'nps';
  }

  get showGrid(): boolean {
    return this.currentType === 'grid';
  }

  get showPriority(): boolean {
    return this.currentType === 'priority';
  }

  get showFile(): boolean {
    return this.currentType === 'file';
  }

  get showNumber(): boolean {
    return this.currentType === 'number';
  }

  get showPlaceholder(): boolean {
    return ['text', 'textarea', 'email', 'phone', 'number', 'url'].includes(
      this.currentType
    );
  }

  get filteredTypes(): QuestionTypeOption[] {
    return this.questionTypes.filter((t) => t.category === this.activeCategory);
  }

  // Helper methods
  createAnswerGroup(
    id: string,
    orderNo: number,
    value = ''
  ): FormGroup {
    return this.fb.group({
      id: [id],
      orderNo: [orderNo],
      value: [value],
    });
  }

  createGridItemGroup(
    id: string,
    orderNo: number,
    label = ''
  ): FormGroup {
    return this.fb.group({
      id: [id],
      orderNo: [orderNo],
      label: [label],
    });
  }

  createPriorityGroup(
    id: string,
    orderNo: number,
    value = ''
  ): FormGroup {
    return this.fb.group({
      id: [id],
      orderNo: [orderNo],
      value: [value],
    });
  }

  selectCategory(category: 'input' | 'choice' | 'advanced' | 'media') {
    this.activeCategory = category;
  }

  selectType(type: MWTextType) {
    this.form.patchValue({ type });
    this.initializeTypeDefaults(type);
  }

  initializeTypeDefaults(type: MWTextType) {
    // Initialize options for choice types
    if (
      ['radio', 'checkbox', 'select'].includes(type) &&
      this.offeredAnswers.length === 0
    ) {
      this.addAnswer();
      this.addAnswer();
      this.addAnswer();
    }

    // Initialize grid
    if (type === 'grid' && this.gridRows.length === 0) {
      this.addGridRow();
      this.addGridRow();
      this.addGridCol();
      this.addGridCol();
      this.addGridCol();
    }

    // Initialize priority
    if (type === 'priority' && this.priorityList.length === 0) {
      this.addPriorityItem();
      this.addPriorityItem();
      this.addPriorityItem();
    }

    // Set NPS defaults
    if (type === 'nps') {
      this.scale.patchValue({
        min: 0,
        max: 10,
        step: 1,
        minLabel: 'Not likely',
        maxLabel: 'Very likely',
      });
    }

    // Set rating defaults
    if (type === 'rating') {
      this.scale.patchValue({ min: 1, max: 5, step: 1 });
    }
  }

  addAnswer() {
    const index = this.offeredAnswers.length + 1;
    this.offeredAnswers.push(
      this.createAnswerGroup('opt-' + index + '-' + Date.now(), index, '')
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
      this.createGridItemGroup('row-' + index + '-' + Date.now(), index, '')
    );
  }

  removeGridRow(i: number) {
    this.gridRows.removeAt(i);
  }

  addGridCol() {
    const index = this.gridCols.length + 1;
    this.gridCols.push(
      this.createGridItemGroup('col-' + index + '-' + Date.now(), index, '')
    );
  }

  removeGridCol(i: number) {
    this.gridCols.removeAt(i);
  }

  addPriorityItem() {
    const index = this.priorityList.length + 1;
    this.priorityList.push(
      this.createPriorityGroup('p' + index + '-' + Date.now(), index, '')
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

  toggleFileType(type: string) {
    const current = this.fileConfig.get('accept')?.value || [];
    const index = current.indexOf(type);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(type);
    }
    this.fileConfig.patchValue({ accept: [...current] });
  }

  isFileTypeSelected(type: string): boolean {
    const current = this.fileConfig.get('accept')?.value || [];
    return current.includes(type);
  }

  getScalePreview(): number[] {
    const min = this.scale.get('min')?.value || 1;
    const max = this.scale.get('max')?.value || 5;
    const range: number[] = [];
    for (let i = min; i <= max && range.length < 11; i++) {
      range.push(i);
    }
    return range;
  }

  getRatingStars(): number[] {
    const max = this.scale.get('max')?.value || 5;
    return Array.from({ length: max }, (_, i) => i + 1);
  }

  isFormValid(): boolean {
    const textOk = !!this.form.get('text')?.value?.trim();
    const idOk = !!this.form.get('id')?.value?.trim();
    return textOk && idOk;
  }

  save() {
    if (this.isFormValid()) {
      const result = this.buildQuestion();
      this.dialogRef.close(result);
    }
  }

  buildQuestion(): MWQuestion {
    const formValue = this.form.value;
    const question: MWQuestion = {
      id: formValue.id,
      text: formValue.text,
      type: formValue.type,
      required: formValue.required,
    };

    // Add placeholder for input types
    if (this.showPlaceholder && formValue.placeholder) {
      question.placeholder = formValue.placeholder;
    }

    // Add options for choice types
    if (this.showOptions && this.offeredAnswers.length > 0) {
      question.offeredAnswers = formValue.offeredAnswers.filter(
        (a: { value: string }) => a.value?.trim()
      );
      question.otherAnswer = formValue.otherAnswer;
    }

    // Add scale config
    if (this.showScale || this.showRating || this.showNps) {
      question.scale = formValue.scale;
    }

    // Add grid config
    if (this.showGrid) {
      question.grid = {
        cellInputType: formValue.grid.cellInputType,
        rows: formValue.grid.rows.filter((r: { label: string }) =>
          r.label?.trim()
        ),
        cols: formValue.grid.cols.filter((c: { label: string }) =>
          c.label?.trim()
        ),
      };
    }

    // Add priority list
    if (this.showPriority) {
      question.priorityList = formValue.priorityList.filter(
        (p: { value: string }) => p.value?.trim()
      );
    }

    // Add file config
    if (this.showFile) {
      question.fileConfig = formValue.fileConfig;
    }

    // Add number config
    if (this.showNumber) {
      question.numberConfig = formValue.numberConfig;
    }

    return question;
  }

  cancel() {
    this.dialogRef.close();
  }
}
