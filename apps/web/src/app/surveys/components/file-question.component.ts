import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MWQuestion } from '../models';

@Component({
  standalone: false,
  selector: 'app-file-question',
  templateUrl: './file-question.component.html',
  styleUrls: ['./file-question.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileQuestionComponent {
  @Input() question!: MWQuestion;
  @Input() form!: FormGroup;

  selectedFiles: File[] = [];

  get accept(): string {
    return this.question.fileConfig?.accept?.join(',') || '*';
  }

  get multiple(): boolean {
    return this.question.fileConfig?.multiple ?? false;
  }

  get maxSize(): number {
    return this.question.fileConfig?.maxSize ?? 10; // MB
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
      const fileNames = this.selectedFiles.map((f) => f.name);
      this.form.get(this.question.id)?.setValue(fileNames);
      this.form.get(this.question.id)?.markAsTouched();
    }
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    const fileNames = this.selectedFiles.map((f) => f.name);
    this.form
      .get(this.question.id)
      ?.setValue(fileNames.length ? fileNames : null);
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}
