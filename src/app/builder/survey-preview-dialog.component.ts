import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MWForm, MWQuestion } from '../surveys/models';

@Component({
  selector: 'app-survey-preview-dialog',
  template: `
    <div class="preview-dialog">
      <div class="preview-header">
        <h2>Survey Preview</h2>
        <button mat-icon-button (click)="close()" aria-label="Close preview">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="preview-content">
        <div class="preview-device">
          <div class="survey-container">
            <div class="survey-header" *ngIf="currentPage">
              <h3 class="survey-title">
                {{ currentPage.name || 'Untitled Survey' }}
              </h3>
              <p class="survey-description" *ngIf="currentPage.description">
                {{ currentPage.description }}
              </p>
              <div class="page-indicator">
                Page {{ currentPageIndex + 1 }} of {{ data.form.pages.length }}
              </div>
            </div>

            <div class="questions-list" *ngIf="currentPage">
              <div
                class="question-item"
                *ngFor="let el of currentPage.elements; let i = index"
              >
                <label class="question-label">
                  {{ i + 1 }}. {{ el.question.text }}
                  <span class="required-marker" *ngIf="el.question.required"
                    >*</span
                  >
                </label>

                <div class="question-input" [ngSwitch]="el.question.type">
                  <!-- Text Input -->
                  <input
                    *ngSwitchCase="'text'"
                    type="text"
                    class="text-input"
                    placeholder="Your answer"
                    disabled
                  />

                  <!-- Textarea -->
                  <textarea
                    *ngSwitchCase="'textarea'"
                    class="textarea-input"
                    placeholder="Your answer"
                    rows="3"
                    disabled
                  ></textarea>

                  <!-- Radio -->
                  <div *ngSwitchCase="'radio'" class="radio-group">
                    <label
                      class="radio-option"
                      *ngFor="let opt of el.question.offeredAnswers"
                    >
                      <input type="radio" [name]="'q-' + el.id" disabled />
                      <span class="radio-label">{{ opt.value }}</span>
                    </label>
                  </div>

                  <!-- Checkbox -->
                  <div *ngSwitchCase="'checkbox'" class="checkbox-group">
                    <label
                      class="checkbox-option"
                      *ngFor="let opt of el.question.offeredAnswers"
                    >
                      <input type="checkbox" disabled />
                      <span class="checkbox-label">{{ opt.value }}</span>
                    </label>
                  </div>

                  <!-- Select -->
                  <select
                    *ngSwitchCase="'select'"
                    class="select-input"
                    disabled
                  >
                    <option value="">Select an option</option>
                    <option
                      *ngFor="let opt of el.question.offeredAnswers"
                      [value]="opt.id"
                    >
                      {{ opt.value }}
                    </option>
                  </select>

                  <!-- Date -->
                  <input
                    *ngSwitchCase="'date'"
                    type="date"
                    class="date-input"
                    disabled
                  />

                  <!-- Time -->
                  <input
                    *ngSwitchCase="'time'"
                    type="time"
                    class="time-input"
                    disabled
                  />

                  <!-- Scale/Rating -->
                  <div *ngSwitchCase="'scale'" class="scale-group">
                    <span class="scale-label">{{
                      el.question.scale?.min || 1
                    }}</span>
                    <div class="scale-options">
                      <button
                        *ngFor="let n of getScaleRange(el.question)"
                        class="scale-btn"
                        disabled
                      >
                        {{ n }}
                      </button>
                    </div>
                    <span class="scale-label">{{
                      el.question.scale?.max || 5
                    }}</span>
                  </div>

                  <!-- Default -->
                  <input
                    *ngSwitchDefault
                    type="text"
                    class="text-input"
                    placeholder="Your answer"
                    disabled
                  />
                </div>
              </div>

              <div class="empty-state" *ngIf="!currentPage.elements.length">
                <mat-icon>quiz</mat-icon>
                <p>No questions added yet</p>
              </div>
            </div>

            <div class="survey-footer">
              <button
                class="nav-btn"
                [disabled]="currentPageIndex === 0"
                (click)="previousPage()"
              >
                <mat-icon>arrow_back</mat-icon> Back
              </button>
              <button
                class="nav-btn primary"
                *ngIf="currentPageIndex < data.form.pages.length - 1"
                (click)="nextPage()"
              >
                Next <mat-icon>arrow_forward</mat-icon>
              </button>
              <button
                class="nav-btn submit"
                *ngIf="currentPageIndex === data.form.pages.length - 1"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .preview-dialog {
        width: 100%;
        max-width: 800px;
      }

      .preview-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 24px;
        border-bottom: 1px solid var(--surface-border);
      }

      .preview-header h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 500;
      }

      .preview-content {
        padding: 24px;
        background: var(--supporting);
        max-height: 70vh;
        overflow-y: auto;
      }

      .preview-device {
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        overflow: hidden;
      }

      .survey-container {
        padding: 24px;
      }

      .survey-header {
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--surface-border);
      }

      .survey-title {
        margin: 0 0 8px;
        font-size: 20px;
        font-weight: 600;
        color: var(--text-primary);
      }

      .survey-description {
        margin: 0 0 12px;
        color: var(--text-secondary);
        font-size: 14px;
      }

      .page-indicator {
        font-size: 12px;
        color: var(--text-secondary);
      }

      .questions-list {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .question-item {
        padding: 16px;
        background: var(--supporting);
        border-radius: 4px;
      }

      .question-label {
        display: block;
        font-weight: 500;
        color: var(--text-primary);
        margin-bottom: 12px;
        font-size: 14px;
      }

      .required-marker {
        color: #ea4335;
        margin-left: 4px;
      }

      .text-input,
      .textarea-input,
      .select-input,
      .date-input,
      .time-input {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid var(--surface-border);
        border-radius: 4px;
        font-size: 14px;
        background: white;
        box-sizing: border-box;
      }

      .textarea-input {
        resize: vertical;
        min-height: 80px;
      }

      .radio-group,
      .checkbox-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .radio-option,
      .checkbox-option {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        font-size: 14px;
        color: var(--text-primary);
      }

      .scale-group {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .scale-label {
        font-size: 12px;
        color: var(--text-secondary);
      }

      .scale-options {
        display: flex;
        gap: 8px;
      }

      .scale-btn {
        width: 36px;
        height: 36px;
        border: 1px solid var(--surface-border);
        border-radius: 4px;
        background: white;
        font-size: 14px;
        cursor: pointer;
      }

      .empty-state {
        text-align: center;
        padding: 40px 20px;
        color: var(--text-secondary);
      }

      .empty-state mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 12px;
        opacity: 0.5;
      }

      .survey-footer {
        display: flex;
        justify-content: space-between;
        margin-top: 24px;
        padding-top: 16px;
        border-top: 1px solid var(--surface-border);
      }

      .nav-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 16px;
        border: 1px solid var(--surface-border);
        border-radius: 4px;
        background: white;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .nav-btn:hover:not(:disabled) {
        background: var(--supporting);
      }

      .nav-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .nav-btn.primary {
        background: var(--primary);
        color: white;
        border-color: var(--primary);
      }

      .nav-btn.primary:hover {
        background: var(--primary-hover);
      }

      .nav-btn.submit {
        background: var(--accent);
        color: white;
        border-color: var(--accent);
      }

      .nav-btn mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    `,
  ],
})
export class SurveyPreviewDialogComponent {
  currentPageIndex = 0;

  constructor(
    public dialogRef: MatDialogRef<SurveyPreviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { form: MWForm }
  ) {}

  get currentPage() {
    return this.data.form.pages[this.currentPageIndex];
  }

  getScaleRange(question: MWQuestion): number[] {
    const min = question.scale?.min || 1;
    const max = question.scale?.max || 5;
    const step = question.scale?.step || 1;
    const range: number[] = [];
    for (let i = min; i <= max; i += step) {
      range.push(i);
    }
    return range;
  }

  nextPage() {
    if (this.currentPageIndex < this.data.form.pages.length - 1) {
      this.currentPageIndex++;
    }
  }

  previousPage() {
    if (this.currentPageIndex > 0) {
      this.currentPageIndex--;
    }
  }

  close() {
    this.dialogRef.close();
  }
}
