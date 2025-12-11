import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MWForm, MWQuestion } from '../surveys/models';

@Component({ standalone: false,
  selector: 'app-survey-preview-dialog',
  template: `
    <div class="preview-dialog">
      <!-- Header -->
      <div class="preview-header">
        <div class="header-left">
          <div class="header-icon">
            <mat-icon>visibility</mat-icon>
          </div>
          <div class="header-text">
            <h2>Survey Preview</h2>
            <p>See how your survey looks to respondents</p>
          </div>
        </div>
        <div class="header-actions">
          <div class="device-toggle">
            <button
              class="device-btn"
              [class.active]="deviceView === 'desktop'"
              (click)="deviceView = 'desktop'"
              matTooltip="Desktop view"
              >
              <mat-icon>computer</mat-icon>
            </button>
            <button
              class="device-btn"
              [class.active]="deviceView === 'mobile'"
              (click)="deviceView = 'mobile'"
              matTooltip="Mobile view"
              >
              <mat-icon>smartphone</mat-icon>
            </button>
          </div>
          <button mat-icon-button class="close-btn" (click)="close()">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </div>
    
      <!-- Content -->
      <div class="preview-body">
        <div
          class="preview-canvas"
          [class.mobile-view]="deviceView === 'mobile'"
          >
          <div
            class="device-frame"
            [class.mobile-frame]="deviceView === 'mobile'"
            >
            <!-- Progress Bar -->
            <div class="progress-bar">
              <div
                class="progress-fill"
                [style.width.%]="progressPercent"
              ></div>
            </div>
    
            <!-- Survey Content -->
            <div class="survey-scroll">
              <div class="survey-content">
                <!-- Survey Header -->
                @if (currentPage) {
                  <div class="survey-header">
                    <h1 class="survey-title">
                      {{ data.form.name || 'Untitled Survey' }}
                    </h1>
                    @if (data.form.description) {
                      <p class="survey-description">
                        {{ data.form.description }}
                      </p>
                    }
                  </div>
                }
    
                <!-- Page Header -->
                @if (currentPage && data.form.pages.length > 1) {
                  <div
                    class="page-header"
                    >
                    <span class="page-badge"
                      >Page {{ currentPageIndex + 1 }} of
                      {{ data.form.pages.length }}</span
                      >
                      @if (currentPage.name) {
                        <h3 class="page-title">
                          {{ currentPage.name }}
                        </h3>
                      }
                      @if (currentPage.description) {
                        <p class="page-description">
                          {{ currentPage.description }}
                        </p>
                      }
                    </div>
                  }
    
                  <!-- Questions -->
                  @if (currentPage) {
                    <div class="questions-list">
                      @for (el of currentPage.elements; track el; let i = $index) {
                        <div
                          class="question-card"
                          >
                          <div class="question-header">
                            <span class="question-number">{{
                              getQuestionNumber(i)
                            }}</span>
                            <span class="question-text">{{ el.question.text }}</span>
                            @if (el.question.required) {
                              <span class="required-marker"
                                >*</span
                                >
                              }
                            </div>
                            <div class="question-input">
                              @switch (el.question.type) {
                                <!-- Text -->
                                @case ('text') {
                                  <input
                                    type="text"
                                    class="text-input"
                                    [placeholder]="el.question.placeholder || 'Your answer'"
                                    disabled
                                    />
                                }
                                <!-- Email -->
                                @case ('email') {
                                  <div class="input-with-icon">
                                    <mat-icon>email</mat-icon>
                                    <input
                                      type="email"
                                      class="text-input"
                                      placeholder="email@example.com"
                                      disabled
                                      />
                                  </div>
                                }
                                <!-- Phone -->
                                @case ('phone') {
                                  <div class="input-with-icon">
                                    <mat-icon>phone</mat-icon>
                                    <input
                                      type="tel"
                                      class="text-input"
                                      placeholder="+1 (555) 000-0000"
                                      disabled
                                      />
                                  </div>
                                }
                                <!-- URL -->
                                @case ('url') {
                                  <div class="input-with-icon">
                                    <mat-icon>link</mat-icon>
                                    <input
                                      type="url"
                                      class="text-input"
                                      placeholder="https://example.com"
                                      disabled
                                      />
                                  </div>
                                }
                                <!-- Number -->
                                @case ('number') {
                                  <div
                                    class="number-input-wrapper"
                                    >
                                    @if (el.question.numberConfig?.prefix) {
                                      <span
                                        class="number-prefix"
                                        >{{ el.question.numberConfig.prefix }}</span
                                        >
                                      }
                                      <input
                                        type="number"
                                        class="text-input number-input"
                                        placeholder="0"
                                        disabled
                                        />
                                      @if (el.question.numberConfig?.suffix) {
                                        <span
                                          class="number-suffix"
                                          >{{ el.question.numberConfig.suffix }}</span
                                          >
                                        }
                                      </div>
                                    }
                                    <!-- Textarea -->
                                    @case ('textarea') {
                                      <textarea
                                        class="textarea-input"
                                        [placeholder]="el.question.placeholder || 'Your answer'"
                                        rows="4"
                                        disabled
                                      ></textarea>
                                    }
                                    <!-- Radio -->
                                    @case ('radio') {
                                      <div class="options-group">
                                        @for (opt of el.question.offeredAnswers; track opt) {
                                          <div
                                            class="option-item radio"
                                            >
                                            <div class="option-circle"></div>
                                            <span>{{ opt.value }}</span>
                                          </div>
                                        }
                                        @if (el.question.otherAnswer) {
                                          <div
                                            class="option-item radio"
                                            >
                                            <div class="option-circle"></div>
                                            <span>Other...</span>
                                          </div>
                                        }
                                      </div>
                                    }
                                    <!-- Checkbox -->
                                    @case ('checkbox') {
                                      <div class="options-group">
                                        @for (opt of el.question.offeredAnswers; track opt) {
                                          <div
                                            class="option-item checkbox"
                                            >
                                            <div class="option-square"></div>
                                            <span>{{ opt.value }}</span>
                                          </div>
                                        }
                                        @if (el.question.otherAnswer) {
                                          <div
                                            class="option-item checkbox"
                                            >
                                            <div class="option-square"></div>
                                            <span>Other...</span>
                                          </div>
                                        }
                                      </div>
                                    }
                                    <!-- Select -->
                                    @case ('select') {
                                      <select
                                        class="select-input"
                                        disabled
                                        >
                                        <option value="">Select an option</option>
                                        @for (opt of el.question.offeredAnswers; track opt) {
                                          <option>
                                            {{ opt.value }}
                                          </option>
                                        }
                                      </select>
                                    }
                                    <!-- Date -->
                                    @case ('date') {
                                      <div class="input-with-icon">
                                        <mat-icon>calendar_today</mat-icon>
                                        <input type="date" class="text-input" disabled />
                                      </div>
                                    }
                                    <!-- Time -->
                                    @case ('time') {
                                      <div class="input-with-icon">
                                        <mat-icon>schedule</mat-icon>
                                        <input type="time" class="text-input" disabled />
                                      </div>
                                    }
                                    <!-- Scale -->
                                    @case ('scale') {
                                      <div class="scale-input">
                                        <span class="scale-label">{{
                                          el.question.scale?.minLabel ||
                                          el.question.scale?.min ||
                                          1
                                        }}</span>
                                        <div class="scale-points">
                                          @for (n of getScaleRange(el.question); track n) {
                                            <button
                                              class="scale-point"
                                              disabled
                                              >
                                              {{ n }}
                                            </button>
                                          }
                                        </div>
                                        <span class="scale-label">{{
                                          el.question.scale?.maxLabel ||
                                          el.question.scale?.max ||
                                          5
                                        }}</span>
                                      </div>
                                    }
                                    <!-- Rating -->
                                    @case ('rating') {
                                      <div class="rating-input">
                                        @for (n of getScaleRange(el.question); track n) {
                                          <mat-icon
                                            class="star-icon"
                                            >star_outline</mat-icon
                                            >
                                          }
                                        </div>
                                      }
                                      <!-- NPS -->
                                      @case ('nps') {
                                        <div class="nps-input">
                                          <span class="nps-label">{{
                                            el.question.scale?.minLabel || 'Not likely'
                                          }}</span>
                                          <div class="nps-points">
                                            @for (n of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; track n) {
                                              <button
                                                class="nps-point"
                                                [class.detractor]="n <= 6"
                                                [class.passive]="n >= 7 && n <= 8"
                                                [class.promoter]="n >= 9"
                                                disabled
                                                >
                                                {{ n }}
                                              </button>
                                            }
                                          </div>
                                          <span class="nps-label">{{
                                            el.question.scale?.maxLabel || 'Very likely'
                                          }}</span>
                                        </div>
                                      }
                                      <!-- Grid -->
                                      @case ('grid') {
                                        <div class="grid-input">
                                          <table class="grid-table">
                                            <thead>
                                              <tr>
                                                <th></th>
                                                @for (col of el.question.grid?.cols; track col) {
                                                  <th>
                                                    {{ col.label }}
                                                  </th>
                                                }
                                              </tr>
                                            </thead>
                                            <tbody>
                                              @for (row of el.question.grid?.rows; track row) {
                                                <tr>
                                                  <td class="row-label">{{ row.label }}</td>
                                                  @for (col of el.question.grid?.cols; track col) {
                                                    <td
                                                      class="grid-cell"
                                                      >
                                                      <div
                                  [class]="
                                    el.question.grid?.cellInputType === 'radio'
                                      ? 'option-circle'
                                      : 'option-square'
                                  "
                                                      ></div>
                                                    </td>
                                                  }
                                                </tr>
                                              }
                                            </tbody>
                                          </table>
                                        </div>
                                      }
                                      <!-- Priority/Ranking -->
                                      @case ('priority') {
                                        <div class="priority-input">
                                          @for (
                                            item of el.question.priorityList; track
                                            item; let j = $index) {
                                            <div
                                              class="priority-item"
                                              >
                                              <mat-icon class="drag-icon">drag_indicator</mat-icon>
                                              <span class="priority-number">{{ j + 1 }}</span>
                                              <span class="priority-text">{{ item.value }}</span>
                                            </div>
                                          }
                                        </div>
                                      }
                                      <!-- File Upload -->
                                      @case ('file') {
                                        <div class="file-input">
                                          <div class="file-dropzone">
                                            <mat-icon>cloud_upload</mat-icon>
                                            <p>
                                              Drag files here or
                                              <span class="upload-link">browse</span>
                                            </p>
                                            <span class="file-hint">
                                              Max {{ el.question.fileConfig?.maxSize || 10 }}MB
                                              @if (el.question.fileConfig?.multiple) {
                                                <span>
                                                  • Multiple files allowed</span
                                                  >
                                                }
                                              </span>
                                            </div>
                                          </div>
                                        }
                                        <!-- Signature -->
                                        @case ('signature') {
                                          <div class="signature-input">
                                            <div class="signature-pad">
                                              <mat-icon>gesture</mat-icon>
                                              <p>Sign here</p>
                                            </div>
                                          </div>
                                        }
                                        <!-- Default -->
                                        @default {
                                          <input
                                            type="text"
                                            class="text-input"
                                            placeholder="Your answer"
                                            disabled
                                            />
                                        }
                                      }
                                    </div>
                                  </div>
                                }
                                @if (!currentPage.elements.length) {
                                  <div class="empty-state">
                                    <mat-icon>quiz</mat-icon>
                                    <p>No questions added yet</p>
                                  </div>
                                }
                              </div>
                            }
                          </div>
                        </div>
    
                        <!-- Footer Navigation -->
                        <div class="survey-footer">
                          <button
                            class="nav-btn back"
                            [disabled]="currentPageIndex === 0"
                            (click)="previousPage()"
                            >
                            <mat-icon>arrow_back</mat-icon>
                            <span>Back</span>
                          </button>
                          @if (currentPageIndex < data.form.pages.length - 1) {
                            <button
                              class="nav-btn next"
                              (click)="nextPage()"
                              >
                              <span>Next</span>
                              <mat-icon>arrow_forward</mat-icon>
                            </button>
                          }
                          @if (currentPageIndex === data.form.pages.length - 1) {
                            <button
                              class="nav-btn submit"
                              >
                              <span>Submit</span>
                              <mat-icon>check</mat-icon>
                            </button>
                          }
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
        height: 100%;
        display: flex;
        flex-direction: column;
        background: var(--surface, #ffffff);
        border-radius: 12px;
        overflow: hidden;
      }

      /* Header */
      .preview-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 24px;
        background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
        color: white;
        flex-shrink: 0;
      }

      .header-left {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .header-icon {
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 10px;
      }

      .header-text h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }

      .header-text p {
        margin: 2px 0 0;
        font-size: 13px;
        opacity: 0.85;
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .device-toggle {
        display: flex;
        background: rgba(255, 255, 255, 0.15);
        border-radius: 8px;
        padding: 4px;
      }

      .device-btn {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        background: transparent;
        color: white;
        border-radius: 6px;
        cursor: pointer;
        opacity: 0.7;
        transition: all 0.2s;
      }

      .device-btn:hover {
        opacity: 1;
      }
      .device-btn.active {
        background: rgba(255, 255, 255, 0.25);
        opacity: 1;
      }

      .close-btn {
        color: white;
        opacity: 0.8;
      }
      .close-btn:hover {
        opacity: 1;
      }

      /* Body */
      .preview-body {
        flex: 1;
        overflow: hidden;
        padding: 24px;
        background: #f1f5f9;
        display: flex;
        justify-content: center;
      }

      .preview-canvas {
        width: 100%;
        max-width: 800px;
        transition: max-width 0.3s ease;
      }

      .preview-canvas.mobile-view {
        max-width: 375px;
      }

      .device-frame {
        background: white;
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      .mobile-frame {
        border-radius: 32px;
        border: 8px solid #1f2937;
      }

      /* Progress */
      .progress-bar {
        height: 4px;
        background: #e2e8f0;
        flex-shrink: 0;
      }

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #6366f1, #8b5cf6);
        transition: width 0.3s ease;
      }

      /* Survey Content */
      .survey-scroll {
        flex: 1;
        overflow-y: auto;
        min-height: 0;
      }

      .survey-content {
        padding: 32px;
      }

      .survey-header {
        text-align: center;
        margin-bottom: 32px;
        padding-bottom: 24px;
        border-bottom: 1px solid #e2e8f0;
      }

      .survey-title {
        margin: 0 0 8px;
        font-size: 24px;
        font-weight: 700;
        color: #1e293b;
      }

      .survey-description {
        margin: 0;
        color: #64748b;
        font-size: 15px;
      }

      .page-header {
        margin-bottom: 24px;
      }

      .page-badge {
        display: inline-block;
        padding: 4px 12px;
        background: #f1f5f9;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        color: #64748b;
        margin-bottom: 12px;
      }

      .page-title {
        margin: 0 0 8px;
        font-size: 18px;
        font-weight: 600;
        color: #1e293b;
      }

      .page-description {
        margin: 0;
        color: #64748b;
        font-size: 14px;
      }

      /* Questions */
      .questions-list {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .question-card {
        padding: 20px;
        background: #f8fafc;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
      }

      .question-header {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        margin-bottom: 16px;
      }

      .question-number {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #6366f1;
        color: white;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
        flex-shrink: 0;
      }

      .question-text {
        flex: 1;
        font-size: 15px;
        font-weight: 500;
        color: #1e293b;
        line-height: 1.4;
      }

      .required-marker {
        color: #ef4444;
        font-weight: 600;
      }

      /* Inputs */
      .text-input,
      .textarea-input,
      .select-input {
        width: 100%;
        padding: 12px 16px;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        font-size: 14px;
        background: white;
        color: #1e293b;
        box-sizing: border-box;
      }

      .textarea-input {
        resize: none;
        min-height: 100px;
      }

      .input-with-icon {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 0 16px;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        background: white;
      }

      .input-with-icon mat-icon {
        color: #94a3b8;
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      .input-with-icon input {
        flex: 1;
        border: none;
        padding: 12px 0;
        font-size: 14px;
        background: transparent;
      }

      .number-input-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .number-prefix,
      .number-suffix {
        color: #64748b;
        font-size: 14px;
      }

      .number-input {
        text-align: center;
        max-width: 120px;
      }

      /* Options */
      .options-group {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .option-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .option-item:hover {
        border-color: #6366f1;
        background: #faf5ff;
      }

      .option-circle {
        width: 20px;
        height: 20px;
        border: 2px solid #cbd5e1;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .option-square {
        width: 20px;
        height: 20px;
        border: 2px solid #cbd5e1;
        border-radius: 4px;
        flex-shrink: 0;
      }

      /* Scale */
      .scale-input,
      .nps-input {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .scale-label,
      .nps-label {
        font-size: 12px;
        color: #64748b;
        max-width: 80px;
        text-align: center;
      }

      .scale-points,
      .nps-points {
        display: flex;
        gap: 8px;
        flex: 1;
        justify-content: center;
      }

      .scale-point,
      .nps-point {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #e2e8f0;
        border-radius: 10px;
        background: white;
        font-size: 14px;
        font-weight: 600;
        color: #1e293b;
        cursor: pointer;
        transition: all 0.2s;
      }

      .scale-point:hover,
      .nps-point:hover {
        border-color: #6366f1;
        background: #faf5ff;
      }

      .nps-point.detractor {
        border-color: rgba(239, 68, 68, 0.3);
        color: #ef4444;
      }
      .nps-point.passive {
        border-color: rgba(234, 179, 8, 0.3);
        color: #eab308;
      }
      .nps-point.promoter {
        border-color: rgba(34, 197, 94, 0.3);
        color: #22c55e;
      }

      /* Rating */
      .rating-input {
        display: flex;
        gap: 8px;
      }

      .star-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
        color: #fbbf24;
        cursor: pointer;
      }

      /* Grid */
      .grid-table {
        width: 100%;
        border-collapse: collapse;
      }

      .grid-table th,
      .grid-table td {
        padding: 12px;
        text-align: center;
        border-bottom: 1px solid #e2e8f0;
      }

      .grid-table th {
        font-size: 13px;
        font-weight: 600;
        color: #64748b;
      }

      .row-label {
        text-align: left !important;
        font-size: 14px;
        color: #1e293b;
      }

      .grid-cell {
        display: flex;
        justify-content: center;
      }

      /* Priority */
      .priority-input {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .priority-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
      }

      .drag-icon {
        color: #cbd5e1;
        cursor: grab;
      }

      .priority-number {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #6366f1;
        color: white;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
      }

      .priority-text {
        flex: 1;
        font-size: 14px;
        color: #1e293b;
      }

      /* File */
      .file-dropzone {
        padding: 32px;
        border: 2px dashed #e2e8f0;
        border-radius: 12px;
        text-align: center;
        background: #fafafa;
      }

      .file-dropzone mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #94a3b8;
        margin-bottom: 12px;
      }

      .file-dropzone p {
        margin: 0 0 8px;
        color: #64748b;
      }

      .upload-link {
        color: #6366f1;
        text-decoration: underline;
        cursor: pointer;
      }

      .file-hint {
        font-size: 12px;
        color: #94a3b8;
      }

      /* Signature */
      .signature-pad {
        padding: 40px;
        border: 2px dashed #e2e8f0;
        border-radius: 12px;
        text-align: center;
        background: #fafafa;
      }

      .signature-pad mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #94a3b8;
      }

      .signature-pad p {
        margin: 8px 0 0;
        color: #94a3b8;
      }

      /* Empty State */
      .empty-state {
        text-align: center;
        padding: 48px 24px;
        color: #94a3b8;
      }

      .empty-state mat-icon {
        font-size: 56px;
        width: 56px;
        height: 56px;
        margin-bottom: 16px;
        opacity: 0.5;
      }

      /* Footer */
      .survey-footer {
        display: flex;
        justify-content: space-between;
        padding: 16px 24px;
        background: #f8fafc;
        border-top: 1px solid #e2e8f0;
        flex-shrink: 0;
      }

      .nav-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 20px;
        border: none;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }

      .nav-btn.back {
        background: white;
        color: #64748b;
        border: 1px solid #e2e8f0;
      }

      .nav-btn.back:hover:not(:disabled) {
        background: #f1f5f9;
      }

      .nav-btn.back:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .nav-btn.next {
        background: #6366f1;
        color: white;
      }

      .nav-btn.next:hover {
        background: #4f46e5;
      }

      .nav-btn.submit {
        background: #22c55e;
        color: white;
      }

      .nav-btn.submit:hover {
        background: #16a34a;
      }

      .nav-btn mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .preview-dialog {
          width: 100%;
          height: 100vh;
          max-height: 100vh;
          border-radius: 0;
        }

        .device-toggle {
          display: none;
        }

        .survey-content {
          padding: 20px;
        }
      }
    `,
  ],
})
export class SurveyPreviewDialogComponent {
  currentPageIndex = 0;
  deviceView: 'desktop' | 'mobile' = 'desktop';

  constructor(
    public dialogRef: MatDialogRef<SurveyPreviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { form: MWForm }
  ) {}

  get currentPage() {
    return this.data.form.pages[this.currentPageIndex];
  }

  get progressPercent(): number {
    return ((this.currentPageIndex + 1) / this.data.form.pages.length) * 100;
  }

  getQuestionNumber(index: number): number {
    let count = 0;
    for (let i = 0; i < this.currentPageIndex; i++) {
      count += this.data.form.pages[i].elements.length;
    }
    return count + index + 1;
  }

  getScaleRange(question: MWQuestion): number[] {
    const min = question.scale?.min || 1;
    const max = question.scale?.max || 5;
    const range: number[] = [];
    for (let i = min; i <= max; i++) {
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
