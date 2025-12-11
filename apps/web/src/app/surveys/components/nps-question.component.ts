import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MWQuestion } from '../models';

@Component({
  standalone: false,
  selector: 'app-nps-question',
  templateUrl: './nps-question.component.html',
  styleUrls: ['./nps-question.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NpsQuestionComponent {
  @Input() question!: MWQuestion;
  @Input() form!: FormGroup;

  readonly scores = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  get currentValue(): number | null {
    return this.form.get(this.question.id)?.value ?? null;
  }

  setScore(value: number): void {
    const control = this.form.get(this.question.id);
    if (control) {
      control.setValue(value);
      control.markAsTouched();
    }
  }

  getScoreClass(score: number): string {
    if (score <= 6) return 'detractor';
    if (score <= 8) return 'passive';
    return 'promoter';
  }

  isSelected(score: number): boolean {
    return this.currentValue === score;
  }
}
