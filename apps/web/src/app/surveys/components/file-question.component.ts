import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  inject,
} from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { MWQuestion } from '../models';
import { UploadService } from '../../core/services/upload.service';

interface UploadedFile {
  file: File;
  key?: string;
  cdnUrl?: string;
  uploading: boolean;
  error?: string;
}

@Component({
  standalone: false,
  selector: 'app-file-question',
  templateUrl: './file-question.component.html',
  styleUrls: ['./file-question.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileQuestionComponent {
  private readonly uploadService = inject(UploadService);
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() question!: MWQuestion;
  @Input() form!: FormGroup;
  @Input() surveyId?: string;

  uploadedFiles: UploadedFile[] = [];

  get accept(): string {
    return this.question.fileConfig?.accept?.join(',') || '*';
  }

  get multiple(): boolean {
    return this.question.fileConfig?.multiple ?? false;
  }

  get maxSize(): number {
    return this.question.fileConfig?.maxSize ?? 10; // MB
  }

  get isUploading(): boolean {
    return this.uploadedFiles.some((f) => f.uploading);
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);

    for (const file of files) {
      if (file.size > this.maxSize * 1024 * 1024) {
        continue;
      }

      const uploadedFile: UploadedFile = {
        file,
        uploading: true,
      };
      this.uploadedFiles.push(uploadedFile);

      if (this.surveyId) {
        this.uploadService
          .uploadWithPresignedUrl(this.surveyId, file)
          .subscribe({
            next: (result) => {
              uploadedFile.key = result.key;
              uploadedFile.cdnUrl = result.cdnUrl;
              uploadedFile.uploading = false;
              this.updateFormValue();
              this.cdr.markForCheck();
            },
            error: (err) => {
              uploadedFile.uploading = false;
              uploadedFile.error = err.message || 'Upload failed';
              this.cdr.markForCheck();
            },
          });
      } else {
        uploadedFile.uploading = false;
        this.updateFormValue();
      }
    }

    this.form.get(this.question.id)?.markAsTouched();
    this.cdr.markForCheck();
    input.value = '';
  }

  private updateFormValue(): void {
    const values = this.uploadedFiles
      .filter((f) => !f.uploading && !f.error)
      .map((f) => ({
        filename: f.file.name,
        size: f.file.size,
        mimeType: f.file.type,
        key: f.key,
        cdnUrl: f.cdnUrl,
      }));
    const ctrl = this.form.get(this.question.id);
    if (!ctrl) return;
    if (ctrl instanceof FormArray) {
      ctrl.clear();
      for (const v of values) {
        ctrl.push(new FormControl(v));
      }
      ctrl.markAsTouched();
      ctrl.updateValueAndValidity();
    } else {
      ctrl.setValue(values.length ? values : null);
    }
  }

  removeFile(index: number): void {
    const file = this.uploadedFiles[index];
    if (file.key) {
      this.uploadService.deleteFile(file.key).subscribe();
    }
    this.uploadedFiles.splice(index, 1);
    this.updateFormValue();
    this.cdr.markForCheck();
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}
