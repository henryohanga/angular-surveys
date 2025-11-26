import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MWQuestion } from '../surveys/models';

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

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      id: ['', Validators.required],
      text: ['', Validators.required],
      type: ['text', Validators.required],
      required: [false],
      otherAnswer: [false],
      offeredAnswers: this.fb.array([]),
    });
  }

  submit() {
    if (this.form.valid) {
      this.save.emit(this.form.value as MWQuestion);
    }
  }

  get offeredAnswers(): FormArray { return this.form.get('offeredAnswers') as FormArray; }

  addAnswer() {
    const index = this.offeredAnswers.length + 1;
    this.offeredAnswers.push(this.fb.group({ id: 'ans-' + index, orderNo: index, value: '' }));
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
        otherAnswer: !!this.initial.otherAnswer,
      });
      this.offeredAnswers.clear();
      if (this.initial.offeredAnswers) {
        this.initial.offeredAnswers.forEach((a, idx) => {
          this.offeredAnswers.push(this.fb.group({ id: a.id, orderNo: idx + 1, value: a.value }));
        });
      }
    }
  }
}
