import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MWQuestion } from '../surveys/models';
import { FormStateService } from './form-state.service';

@Component({
  selector: 'app-question-editor',
  templateUrl: './question-editor.component.html',
  styleUrls: ['./question-editor.component.scss']
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
    });
    this.pageNumbers = this.state.getForm().pages.map(p => p.number);
  }

  submit() {
    if (this.form.valid) {
      this.save.emit(this.form.value as MWQuestion);
    }
  }

  get offeredAnswers(): FormArray { return this.form.get('offeredAnswers') as FormArray; }

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
          label: ['']
        })
      })
    );
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
                label: [a.pageFlow?.label ?? '']
              })
            })
          );
        });
      }
    }
  }
}
