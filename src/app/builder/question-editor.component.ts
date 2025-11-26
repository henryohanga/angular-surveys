import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MWQuestion } from '../surveys/models';

@Component({
  selector: 'app-question-editor',
  templateUrl: './question-editor.component.html',
  styleUrls: ['./question-editor.component.scss']
})
export class QuestionEditorComponent {
  @Output() save = new EventEmitter<MWQuestion>();
  @Output() dismissed = new EventEmitter<void>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      id: ['', Validators.required],
      text: ['', Validators.required],
      type: ['text', Validators.required],
      required: [false],
    });
  }

  submit() {
    if (this.form.valid) {
      this.save.emit(this.form.value as MWQuestion);
    }
  }
}
