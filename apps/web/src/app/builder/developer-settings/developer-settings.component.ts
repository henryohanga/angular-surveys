import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
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
import { Subject, firstValueFrom } from 'rxjs';
import {
  DeveloperApiService,
  WorkspaceDeveloperSettings,
} from '../../core/services/developer-api.service';

@Component({
  selector: 'app-developer-settings',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
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
              webhooks, and API integrations. Visit
              <a routerLink="/settings">Settings</a> to manage all your
              developer preferences.
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

          <!-- Question Mappings Info -->
          <mat-expansion-panel class="section-panel">
            <mat-expansion-panel-header>
              <mat-panel-title>
                <mat-icon>swap_horiz</mat-icon>
                Question Mappings
              </mat-panel-title>
              <mat-panel-description>
                Configure external IDs in the question editor
              </mat-panel-description>
            </mat-expansion-panel-header>

            <div class="mappings-section">
              <div class="info-box">
                <mat-icon>info</mat-icon>
                <div>
                  <p><strong>External IDs are now inline!</strong></p>
                  <p>
                    Configure external IDs directly in the question editor by
                    expanding the "Developer Settings" section on each question.
                    This includes:
                  </p>
                  <ul>
                    <li>External ID for webhook payloads</li>
                    <li>External values for choice options</li>
                    <li>Field names for API responses</li>
                  </ul>
                </div>
              </div>
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

      .toggle-section .hint a {
        color: #667eea;
        text-decoration: none;
        font-weight: 500;
      }

      .toggle-section .hint a:hover {
        text-decoration: underline;
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

      .info-box {
        display: flex;
        gap: 16px;
        padding: 16px;
        background: rgba(102, 126, 234, 0.1);
        border-radius: 8px;
        border-left: 4px solid #667eea;
      }

      .info-box mat-icon {
        color: #667eea;
        flex-shrink: 0;
      }

      .info-box p {
        margin: 0 0 8px 0;
        color: rgba(0, 0, 0, 0.7);
      }

      .info-box ul {
        margin: 0;
        padding-left: 20px;
        color: rgba(0, 0, 0, 0.6);
      }

      .info-box li {
        margin-bottom: 4px;
      }
    `,
  ],
})
export class DeveloperSettingsComponent implements OnInit, OnDestroy {
  private readonly snackBar = inject(MatSnackBar);
  private readonly developerApi = inject(DeveloperApiService);
  private readonly destroy$ = new Subject<void>();

  developerSettings: WorkspaceDeveloperSettings = { enabled: false };
  showSecret = false;
  isSaving = false;
  isRegenerating = false;
  isLoading = true;

  ngOnInit(): void {
    this.loadSettings();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async loadSettings(): Promise<void> {
    this.isLoading = true;
    try {
      this.developerSettings = await firstValueFrom(
        this.developerApi.getWorkspaceDeveloperSettings()
      );
    } catch {
      // User might not have developer settings yet
      this.developerSettings = { enabled: false };
    } finally {
      this.isLoading = false;
    }
  }

  async toggleDeveloperMode(enabled: boolean): Promise<void> {
    this.isSaving = true;
    try {
      this.developerSettings = await firstValueFrom(
        this.developerApi.updateWorkspaceDeveloperSettings({ enabled })
      );
      this.snackBar.open(
        enabled ? 'Developer mode enabled' : 'Developer mode disabled',
        'Close',
        { duration: 2000 }
      );
    } catch {
      this.snackBar.open('Failed to update settings', 'Close', {
        duration: 3000,
      });
    } finally {
      this.isSaving = false;
    }
  }

  async regenerateCredentials(): Promise<void> {
    this.isRegenerating = true;
    try {
      this.developerSettings = await firstValueFrom(
        this.developerApi.regenerateWorkspaceCredentials()
      );
      this.snackBar.open('Credentials regenerated', 'Close', {
        duration: 3000,
      });
    } catch {
      this.snackBar.open('Failed to regenerate credentials', 'Close', {
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
}
