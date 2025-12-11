import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MWQuestion } from '../models';

@Component({
  standalone: false,
  selector: 'app-rating-question',
  templateUrl: './rating-question.component.html',
  styleUrls: ['./rating-question.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatingQuestionComponent {
  @Input() question!: MWQuestion;
  @Input() form!: FormGroup;

  readonly stars = [1, 2, 3, 4, 5];
  hoveredStar: number | null = null;

  get currentValue(): number | null {
    return this.form.get(this.question.id)?.value ?? null;
  }

  setRating(value: number): void {
    const control = this.form.get(this.question.id);
    if (control) {
      control.setValue(value);
      control.markAsTouched();
    }
  }

  onHover(star: number): void {
    this.hoveredStar = star;
  }

  onLeave(): void {
    this.hoveredStar = null;
  }

  isActive(star: number): boolean {
    const compareValue = this.hoveredStar ?? this.currentValue ?? 0;
    return star <= compareValue;
  }
}
