import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MWQuestion } from '../models';

@Component({
  selector: 'app-scale-question',
  templateUrl: './scale-question.component.html',
  styleUrls: ['./scale-question.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScaleQuestionComponent {
  @Input() question!: MWQuestion;
  @Input() form!: FormGroup;

  min(): number {
    return this.question.scale?.min ?? 1;
  }
  max(): number {
    return this.question.scale?.max ?? 5;
  }
  step(): number {
    return this.question.scale?.step ?? 1;
  }
  minLabel(): string {
    return this.question.scale?.minLabel ?? '';
  }
  maxLabel(): string {
    return this.question.scale?.maxLabel ?? '';
  }

  get scalePoints(): number[] {
    const points: number[] = [];
    const minVal = this.min();
    const maxVal = this.max();
    const stepVal = this.step();
    for (let i = minVal; i <= maxVal; i += stepVal) {
      points.push(i);
    }
    return points;
  }

  get currentValue(): number {
    return this.form.get(this.question.id)?.value ?? this.min();
  }

  setValue(value: number) {
    this.form.get(this.question.id)?.setValue(value);
  }
}
