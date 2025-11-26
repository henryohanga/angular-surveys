import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MWQuestion } from '../surveys/models';
import { FormStateService } from './form-state.service';

@Component({
  selector: 'app-question-editor',
  templateUrl: './question-editor.component.html',
  styleUrls: ['./question-editor.component.scss'],
})
export class QuestionEditorComponent implements OnChanges {
  @Input() initial: MWQuestion | null = null;
  @Output() save = new EventEmitter<MWQuestion>();
  @Output() dismissed = new EventEmitter<void>();

  form: FormGroup;

  pageNumbers: number[] = [];

  constructor(private fb: FormBuilder, private state: FormStateService) {
    this.form = this.fb.group({
      id: ['', Validators.required],
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
        min: [1],
        max: [5],
        step: [1],
        minLabel: [''],
        maxLabel: [''],
      }),
    });
    this.pageNumbers = this.state.getForm().pages.map((p) => p.number);
  }

  submit() {
    if (this.form.valid) {
      this.save.emit(this.form.value as MWQuestion);
    }
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

  addAnswer() {
    const index = this.offeredAnswers.length + 1;
    this.offeredAnswers.push(
      this.fb.group({
        id: 'ans-' + index,
        orderNo: index,
        value: '',
        pageFlow: this.fb.group({
          nextPage: [false],
          goToPage: [null],
          label: [''],
        }),
      })
    );
  }

  addGridRow() {
    const index = this.gridRows.length + 1;
    this.gridRows.push(
      this.fb.group({ id: 'row-' + index, orderNo: index, label: '' })
    );
  }

  removeGridRow(i: number) {
    this.gridRows.removeAt(i);
  }

  addGridCol() {
    const index = this.gridCols.length + 1;
    this.gridCols.push(
      this.fb.group({ id: 'col-' + index, orderNo: index, label: '' })
    );
  }

  removeGridCol(i: number) {
    this.gridCols.removeAt(i);
  }

  addPriorityItem() {
    const index = this.priorityList.length + 1;
    this.priorityList.push(
      this.fb.group({ id: 'p' + index, orderNo: index, value: '' })
    );
  }

  removePriorityItem(i: number) {
    this.priorityList.removeAt(i);
  }

  removeAnswer(i: number) {
    this.offeredAnswers.removeAt(i);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initial'] && this.initial) {
      this.form.patchValue({
        id: this.initial.id,
        text: this.initial.text,
        type: this.initial.type,
        required: !!this.initial.required,
        pageFlowModifier: !!this.initial.pageFlowModifier,
        otherAnswer: !!this.initial.otherAnswer,
      });
      this.offeredAnswers.clear();
      if (this.initial.offeredAnswers) {
        this.initial.offeredAnswers.forEach((a, idx) => {
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

      const g = this.grid;
      (g.get('rows') as FormArray).clear();
      (g.get('cols') as FormArray).clear();
      if (this.initial.grid) {
        g.patchValue({ cellInputType: this.initial.grid.cellInputType });
        this.initial.grid.rows.forEach((r, idx) => {
          this.gridRows.push(
            this.fb.group({ id: r.id, orderNo: idx + 1, label: r.label })
          );
        });
        this.initial.grid.cols.forEach((c, idx) => {
          this.gridCols.push(
            this.fb.group({ id: c.id, orderNo: idx + 1, label: c.label })
          );
        });
      }

      this.priorityList.clear();
      if (this.initial.priorityList) {
        this.initial.priorityList.forEach((it, idx) => {
          this.priorityList.push(
            this.fb.group({ id: it.id, orderNo: idx + 1, value: it.value })
          );
        });
      }

      if (this.initial.scale) {
        this.scale.patchValue({
          min: this.initial.scale.min,
          max: this.initial.scale.max,
          step: this.initial.scale.step ?? 1,
          minLabel: this.initial.scale.minLabel ?? '',
          maxLabel: this.initial.scale.maxLabel ?? '',
        });
      }
    }
  }
}
