import { Component, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { Subject, firstValueFrom } from 'rxjs';
import { SurveyApiService } from '../../core/services/survey-api.service';
import { MWForm, MWQuestion } from '../../surveys/models';

interface QuestionMapping {
  questionId: string;
  externalId: string;
  fieldName?: string;
  description?: string;
}

interface DeveloperSettings {
  enabled: boolean;
  apiKey?: string;
  apiSecret?: string;
  questionMappings?: QuestionMapping[];
  customMetadataFields?: string[];
}

@Component({
  selector: 'app-developer-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatExpansionModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDividerModule,
    MatChipsModule,
  ],
  template: `
    <div class="developer-settings">
      <mat-card class="settings-card">
        <mat-card-header>
          <mat-icon mat-card-avatar>code</mat-icon>
          <mat-card-title>Developer Mode</mat-card-title>
          <mat-card-subtitle>
            Enable developer features for API integration
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <div class="toggle-section">
            <mat-slide-toggle
              [checked]="developerSettings.enabled"
              (change)="toggleDeveloperMode($event.checked)"
              color="primary"
            >
              Enable Developer Mode
            </mat-slide-toggle>
            <p class="hint">
              Developer mode allows you to configure custom question IDs,
              webhooks, and API integrations.
            </p>
          </div>

          @if (developerSettings.enabled) {
          <mat-divider></mat-divider>

          <!-- API Credentials Section -->
          <mat-expansion-panel class="section-panel">
            <mat-expansion-panel-header>
              <mat-panel-title>
                <mat-icon>vpn_key</mat-icon>
                API Credentials
              </mat-panel-title>
              <mat-panel-description>
                Credentials for webhook signature verification
              </mat-panel-description>
            </mat-expansion-panel-header>

            <div class="credentials-section">
              <div class="credential-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>API Key</mat-label>
                  <input
                    matInput
                    [value]="developerSettings.apiKey || 'Not generated'"
                    readonly
                  />
                  <button
                    mat-icon-button
                    matSuffix
                    (click)="copyToClipboard(developerSettings.apiKey)"
                    matTooltip="Copy to clipboard"
                  >
                    <mat-icon>content_copy</mat-icon>
                  </button>
                </mat-form-field>
              </div>

              <div class="credential-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>API Secret</mat-label>
                  <input
                    matInput
                    [type]="showSecret ? 'text' : 'password'"
                    [value]="developerSettings.apiSecret || 'Not generated'"
                    readonly
                  />
                  <button
                    mat-icon-button
                    matSuffix
                    (click)="showSecret = !showSecret"
                    matTooltip="Toggle visibility"
                  >
                    <mat-icon>{{
                      showSecret ? 'visibility_off' : 'visibility'
                    }}</mat-icon>
                  </button>
                  <button
                    mat-icon-button
                    matSuffix
                    (click)="copyToClipboard(developerSettings.apiSecret)"
                    matTooltip="Copy to clipboard"
                  >
                    <mat-icon>content_copy</mat-icon>
                  </button>
                </mat-form-field>
              </div>

              <button
                mat-stroked-button
                color="warn"
                (click)="regenerateCredentials()"
                [disabled]="isRegenerating"
              >
                <mat-icon>refresh</mat-icon>
                {{
                  isRegenerating ? 'Regenerating...' : 'Regenerate Credentials'
                }}
              </button>
              <p class="warning-text">
                Warning: Regenerating credentials will invalidate existing
                integrations.
              </p>
            </div>
          </mat-expansion-panel>

          <!-- Question Mappings Section -->
          <mat-expansion-panel class="section-panel" [expanded]="true">
            <mat-expansion-panel-header>
              <mat-panel-title>
                <mat-icon>swap_horiz</mat-icon>
                Question Mappings
              </mat-panel-title>
              <mat-panel-description>
                Map questions to external system identifiers
              </mat-panel-description>
            </mat-expansion-panel-header>

            <div class="mappings-section">
              <p class="section-description">
                Assign custom external IDs to questions for easier integration
                with your systems. These IDs will be used in webhook payloads
                when question mappings are enabled.
              </p>

              @if (allQuestions.length === 0) {
              <div class="empty-state">
                <mat-icon>help_outline</mat-icon>
                <p>Add questions to your survey to configure mappings.</p>
              </div>
              } @else {
              <div class="mappings-list">
                @for (question of allQuestions; track question.id) {
                <div class="mapping-row">
                  <div class="question-info">
                    <span class="question-text">{{ question.text }}</span>
                    <span class="question-type">{{ question.type }}</span>
                  </div>
                  <div class="mapping-fields">
                    <mat-form-field appearance="outline" class="mapping-field">
                      <mat-label>External ID</mat-label>
                      <input
                        matInput
                        [value]="getMapping(question.id)?.externalId || ''"
                        (blur)="
                          updateMapping(question.id, 'externalId', $event)
                        "
                        placeholder="e.g., customer_name"
                      />
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="mapping-field">
                      <mat-label>Field Name (optional)</mat-label>
                      <input
                        matInput
                        [value]="getMapping(question.id)?.fieldName || ''"
                        (blur)="updateMapping(question.id, 'fieldName', $event)"
                        placeholder="e.g., name"
                      />
                    </mat-form-field>
                  </div>
                </div>
                }
              </div>

              <div class="actions-row">
                <button
                  mat-stroked-button
                  color="primary"
                  (click)="saveMappings()"
                  [disabled]="isSaving"
                >
                  <mat-icon>save</mat-icon>
                  {{ isSaving ? 'Saving...' : 'Save Mappings' }}
                </button>
                <button mat-stroked-button (click)="clearMappings()">
                  <mat-icon>clear_all</mat-icon>
                  Clear All
                </button>
              </div>
              }
            </div>
          </mat-expansion-panel>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .developer-settings {
        padding: 16px;
      }

      .settings-card {
        max-width: 800px;
      }

      .settings-card mat-card-header {
        margin-bottom: 16px;
      }

      .settings-card mat-icon[mat-card-avatar] {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .toggle-section {
        padding: 16px 0;
      }

      .toggle-section .hint {
        margin-top: 8px;
        color: rgba(0, 0, 0, 0.6);
        font-size: 13px;
      }

      .section-panel {
        margin-top: 16px;
      }

      .section-panel mat-panel-title {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .credentials-section {
        padding: 16px 0;
      }

      .credential-row {
        margin-bottom: 16px;
      }

      .full-width {
        width: 100%;
      }

      .warning-text {
        color: #f44336;
        font-size: 12px;
        margin-top: 8px;
      }

      .mappings-section {
        padding: 16px 0;
      }

      .section-description {
        color: rgba(0, 0, 0, 0.6);
        font-size: 13px;
        margin-bottom: 16px;
      }

      .empty-state {
        text-align: center;
        padding: 32px;
        color: rgba(0, 0, 0, 0.4);
      }

      .empty-state mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
      }

      .mappings-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .mapping-row {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 12px;
        background: rgba(0, 0, 0, 0.02);
        border-radius: 8px;
        border: 1px solid rgba(0, 0, 0, 0.08);
      }

      .question-info {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .question-text {
        font-weight: 500;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .question-type {
        background: rgba(0, 0, 0, 0.08);
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 11px;
        text-transform: uppercase;
      }

      .mapping-fields {
        display: flex;
        gap: 16px;
      }

      .mapping-field {
        flex: 1;
      }

      .actions-row {
        display: flex;
        gap: 12px;
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid rgba(0, 0, 0, 0.08);
      }

      @media (max-width: 600px) {
        .mapping-fields {
          flex-direction: column;
        }
      }
    `,
  ],
})
export class DeveloperSettingsComponent implements OnInit, OnDestroy {
  @Input() surveyId!: string;
  @Input() form!: MWForm;

  private readonly snackBar = inject(MatSnackBar);
  private readonly surveyApi = inject(SurveyApiService);
  private readonly destroy$ = new Subject<void>();

  developerSettings: DeveloperSettings = { enabled: false };
  allQuestions: MWQuestion[] = [];
  showSecret = false;
  isSaving = false;
  isRegenerating = false;

  private mappingsMap = new Map<string, QuestionMapping>();

  ngOnInit(): void {
    this.extractQuestions();
    this.loadSettings();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private extractQuestions(): void {
    this.allQuestions = [];
    if (this.form?.pages) {
      for (const page of this.form.pages) {
        for (const element of page.elements) {
          if (element.type === 'question' && element.question) {
            this.allQuestions.push(element.question);
          }
        }
      }
    }
  }

  private async loadSettings(): Promise<void> {
    if (!this.surveyId) return;

    try {
      const survey = await firstValueFrom(
        this.surveyApi.getSurvey(this.surveyId)
      );
      const settings = (
        survey as unknown as { developerSettings?: DeveloperSettings }
      ).developerSettings;
      if (settings) {
        this.developerSettings = settings;
        if (settings.questionMappings) {
          for (const mapping of settings.questionMappings) {
            this.mappingsMap.set(mapping.questionId, mapping);
          }
        }
      }
    } catch {
      // Survey might not have developer settings yet
    }
  }

  async toggleDeveloperMode(enabled: boolean): Promise<void> {
    this.developerSettings.enabled = enabled;

    if (enabled && !this.developerSettings.apiKey) {
      // Generate initial credentials
      this.developerSettings.apiKey = this.generateApiKey();
      this.developerSettings.apiSecret = this.generateApiSecret();
    }

    await this.saveSettings();
  }

  getMapping(questionId: string): QuestionMapping | undefined {
    return this.mappingsMap.get(questionId);
  }

  updateMapping(
    questionId: string,
    field: 'externalId' | 'fieldName',
    event: Event
  ): void {
    const value = (event.target as HTMLInputElement).value.trim();

    let mapping = this.mappingsMap.get(questionId);
    if (!mapping) {
      mapping = { questionId, externalId: '' };
      this.mappingsMap.set(questionId, mapping);
    }

    if (field === 'externalId') {
      mapping.externalId = value;
    } else {
      mapping.fieldName = value || undefined;
    }

    // Remove mapping if empty
    if (!mapping.externalId && !mapping.fieldName) {
      this.mappingsMap.delete(questionId);
    }
  }

  async saveMappings(): Promise<void> {
    this.developerSettings.questionMappings = Array.from(
      this.mappingsMap.values()
    ).filter((m) => m.externalId);
    await this.saveSettings();
  }

  clearMappings(): void {
    this.mappingsMap.clear();
    this.developerSettings.questionMappings = [];
    this.saveSettings();
  }

  async regenerateCredentials(): Promise<void> {
    this.isRegenerating = true;
    try {
      this.developerSettings.apiKey = this.generateApiKey();
      this.developerSettings.apiSecret = this.generateApiSecret();
      await this.saveSettings();
      this.snackBar.open('Credentials regenerated', 'Close', {
        duration: 3000,
      });
    } finally {
      this.isRegenerating = false;
    }
  }

  copyToClipboard(value?: string): void {
    if (value) {
      navigator.clipboard.writeText(value);
      this.snackBar.open('Copied to clipboard', 'Close', { duration: 2000 });
    }
  }

  private async saveSettings(): Promise<void> {
    if (!this.surveyId) return;

    this.isSaving = true;
    try {
      await firstValueFrom(
        this.surveyApi.updateSurvey(this.surveyId, {
          developerSettings: this.developerSettings,
        } as unknown as Parameters<typeof this.surveyApi.updateSurvey>[1])
      );
      this.snackBar.open('Settings saved', 'Close', { duration: 2000 });
    } catch {
      this.snackBar.open('Failed to save settings', 'Close', {
        duration: 3000,
      });
    } finally {
      this.isSaving = false;
    }
  }

  private generateApiKey(): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'ask_';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private generateApiSecret(): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'ass_';
    for (let i = 0; i < 48; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
