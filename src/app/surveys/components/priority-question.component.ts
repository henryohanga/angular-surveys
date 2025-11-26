import { Component, Input } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { MWQuestion, MWPriorityItem } from '../models';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-priority-question',
  templateUrl: './priority-question.component.html',
  styleUrls: ['./priority-question.component.scss']
})
export class PriorityQuestionComponent {
  @Input() question!: MWQuestion;
  @Input() form!: FormGroup;

  items(): MWPriorityItem[] {
    return this.question.priorityList ?? [];
  }

  arr(): FormArray {
    return this.form.get(this.question.id) as FormArray;
  }

  drop(e: CdkDragDrop<string[]>) {
    const values = this.arr().value as string[];
    moveItemInArray(values, e.previousIndex, e.currentIndex);
    this.arr().clear();
    for (const v of values) this.arr().push(new FormControl(v));
  }
}

