import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MWQuestion } from '../models';

@Component({
  selector: 'app-textarea-question',
  templateUrl: './textarea-question.component.html',
  styleUrls: ['./textarea-question.component.scss']
})
export class TextareaQuestionComponent {
  @Input() question!: MWQuestion;
  @Input() form!: FormGroup;
}

