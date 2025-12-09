import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { MWGrid, MWQuestion } from '../models';

@Component({
  selector: 'app-grid-question',
  templateUrl: './grid-question.component.html',
  styleUrls: ['./grid-question.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridQuestionComponent {
  @Input() question!: MWQuestion;
  @Input() form!: FormGroup;

  get grid(): MWGrid | undefined {
    return this.question.grid;
  }

  rowControl(rowId: string): FormControl | FormArray | null {
    const group = this.form.get(this.question.id) as FormGroup;
    return (group?.get(rowId) as FormControl | FormArray) ?? null;
  }

  toggleCheckboxRow(rowId: string, colId: string, checked: boolean) {
    const arr = this.rowControl(rowId) as FormArray;
    if (!arr) return;
    if (checked) {
      arr.push(new FormControl(colId));
    } else {
      const i = arr.controls.findIndex(c => c.value === colId);
      if (i > -1) arr.removeAt(i);
    }
  }

  trackByRow(_i: number, r: import('../models').MWGridRow): string { return r.id; }
  trackByCol(_i: number, c: import('../models').MWGridCol): string { return c.id; }
}
