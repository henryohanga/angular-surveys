import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { Subject, firstValueFrom } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  DeveloperApiService,
  WorkspaceDeveloperSettings,
} from '../core/services/developer-api.service';
import { AuthService } from '../core/services/auth.service';
import { HttpClient } from '@angular/common/http';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
  ],
  template: `
    <div class="settings">
      <!-- Header -->
      <div class="settings-header">
        <div class="header-content">
          <h1>Settings</h1>
          <p>Manage your account and preferences</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="toolbar">
        <div class="tabs">
          <button
            class="tab"
            [class.active]="activeTab === 'profile'"
            (click)="activeTab = 'profile'"
          >
            <mat-icon>person</mat-icon>
            Profile
          </button>
          @if (developerSettings.enabled) {
          <button
            class="tab"
            [class.active]="activeTab === 'developer'"
            (click)="activeTab = 'developer'"
          >
            <mat-icon>code</mat-icon>
            Developer
          </button>
          }
        </div>
      </div>

      <!-- Loading State -->
      @if (isLoading) {
      <div class="loading">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Loading...</p>
      </div>
      }

      <!-- Profile Tab -->
      @if (!isLoading && activeTab === 'profile') {
      <div class="content">
        <div class="section-grid">
          <!-- Profile Card -->
          <div class="settings-card">
            <div class="card-header">
              <div class="card-title">
                <mat-icon>account_circle</mat-icon>
                <h3>Profile Information</h3>
              </div>
            </div>
            <div class="card-body">
              @if (!isEditingProfile) {
              <div class="profile-display">
                <div class="profile-row">
                  <span class="profile-label">Name</span>
                  <span class="profile-value">{{
                    profile?.name || 'Not set'
                  }}</span>
                </div>
                <div class="profile-row">
                  <span class="profile-label">Email</span>
                  <span class="profile-value">{{ profile?.email }}</span>
                </div>
              </div>
              <div class="card-actions">
                <button
                  mat-stroked-button
                  color="primary"
                  (click)="startEditProfile()"
                >
                  <mat-icon>edit</mat-icon>
                  Edit Profile
                </button>
              </div>
              } @else {
              <div class="profile-edit">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Name</mat-label>
                  <input
                    matInput
                    [(ngModel)]="editName"
                    placeholder="Your name"
                  />
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Email</mat-label>
                  <input matInput [value]="profile?.email" disabled />
                  <mat-hint>Email cannot be changed</mat-hint>
                </mat-form-field>
              </div>
              <div class="card-actions">
                <button
                  mat-raised-button
                  color="primary"
                  (click)="saveProfile()"
                  [disabled]="isSavingProfile"
                >
                  {{ isSavingProfile ? 'Saving...' : 'Save Changes' }}
                </button>
                <button mat-stroked-button (click)="cancelEditProfile()">
                  Cancel
                </button>
              </div>
              }
            </div>
          </div>

          <!-- Developer Mode Card -->
          <div class="settings-card">
            <div class="card-header">
              <div class="card-title">
                <mat-icon>code</mat-icon>
                <h3>Developer Mode</h3>
              </div>
            </div>
            <div class="card-body">
              <div class="toggle-row">
                <div class="toggle-info">
                  <span class="toggle-label">Enable Developer Mode</span>
                  <span class="toggle-description">
                    Access API credentials, webhooks, and external ID mappings
                  </span>
                </div>
                <mat-slide-toggle
                  [checked]="developerSettings.enabled"
                  (change)="toggleDeveloperMode($event.checked)"
                  [disabled]="isSaving"
                  color="primary"
                ></mat-slide-toggle>
              </div>
              @if (developerSettings.enabled) {
              <div class="dev-hint">
                <mat-icon>info</mat-icon>
                <span>
                  Go to the <strong>Developer</strong> tab to manage your API
                  credentials and view integration guides.
                </span>
              </div>
              }
            </div>
          </div>
        </div>
      </div>
      }

      <!-- Developer Tab -->
      @if (!isLoading && activeTab === 'developer' && developerSettings.enabled)
      {
      <div class="content">
        <div class="section-grid">
          <!-- API Credentials Card -->
          <div class="settings-card wide">
            <div class="card-header">
              <div class="card-title">
                <mat-icon>vpn_key</mat-icon>
                <h3>API Credentials</h3>
              </div>
            </div>
            <div class="card-body">
              <p class="card-description">
                Use these credentials to authenticate webhook requests and API
                calls. Keep your API Secret secure and never expose it publicly.
              </p>

              <div class="credentials-grid">
                <div class="credential-item">
                  <span class="credential-label">API Key</span>
                  <div class="credential-value">
                    <code>{{ developerSettings.apiKey }}</code>
                    <button
                      mat-icon-button
                      matTooltip="Copy API Key"
                      (click)="copyToClipboard(developerSettings.apiKey)"
                    >
                      <mat-icon>content_copy</mat-icon>
                    </button>
                  </div>
                </div>

                <div class="credential-item">
                  <span class="credential-label">API Secret</span>
                  <div class="credential-value">
                    <code>{{
                      showSecret
                        ? developerSettings.apiSecret
                        : '••••••••••••••••••••••••••••••••'
                    }}</code>
                    <button
                      mat-icon-button
                      [matTooltip]="showSecret ? 'Hide' : 'Show'"
                      (click)="showSecret = !showSecret"
                    >
                      <mat-icon>{{
                        showSecret ? 'visibility_off' : 'visibility'
                      }}</mat-icon>
                    </button>
                    <button
                      mat-icon-button
                      matTooltip="Copy API Secret"
                      (click)="copyToClipboard(developerSettings.apiSecret)"
                    >
                      <mat-icon>content_copy</mat-icon>
                    </button>
                  </div>
                </div>
              </div>

              <mat-divider></mat-divider>

              <div class="regenerate-row">
                <div class="regenerate-info">
                  <span class="regenerate-warning">
                    <mat-icon>warning</mat-icon>
                    Regenerating credentials will invalidate all existing
                    integrations.
                  </span>
                </div>
                <button
                  mat-stroked-button
                  color="warn"
                  (click)="regenerateCredentials()"
                  [disabled]="isRegenerating"
                >
                  <mat-icon>refresh</mat-icon>
                  {{ isRegenerating ? 'Regenerating...' : 'Regenerate' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Quick Start Guide Card -->
          <div class="settings-card wide">
            <div class="card-header">
              <div class="card-title">
                <mat-icon>menu_book</mat-icon>
                <h3>Integration Guide</h3>
              </div>
            </div>
            <div class="card-body">
              <div class="guide-grid">
                <div class="guide-item">
                  <div class="guide-icon">
                    <mat-icon>swap_horiz</mat-icon>
                  </div>
                  <div class="guide-content">
                    <h4>Question Mappings</h4>
                    <p>
                      Configure external IDs in the question editor's Developer
                      Settings section. Set custom IDs and field names for
                      webhook payloads.
                    </p>
                  </div>
                </div>

                <div class="guide-item">
                  <div class="guide-icon">
                    <mat-icon>webhook</mat-icon>
                  </div>
                  <div class="guide-content">
                    <h4>Webhooks</h4>
                    <p>
                      Configure webhooks per survey from the Builder's Developer
                      Tools. Receive events like response.submitted with signed
                      payloads.
                    </p>
                  </div>
                </div>

                <div class="guide-item">
                  <div class="guide-icon">
                    <mat-icon>security</mat-icon>
                  </div>
                  <div class="guide-content">
                    <h4>Signature Verification</h4>
                    <p>
                      Verify webhook authenticity using the X-Webhook-Signature
                      header with HMAC-SHA256 and your API Secret.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .settings {
        padding: var(--spacing-lg) var(--spacing-xl);
        min-height: calc(100vh - 64px);
      }

      /* Header */
      .settings-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-xl);
      }

      .header-content h1 {
        font-size: 28px;
        font-weight: 600;
        color: var(--text-primary);
        margin: 0 0 var(--spacing-xs);
      }

      .header-content p {
        font-size: 14px;
        color: var(--text-secondary);
        margin: 0;
      }

      /* Toolbar & Tabs */
      .toolbar {
        margin-bottom: var(--spacing-lg);
      }

      .tabs {
        display: flex;
        gap: var(--spacing-sm);
      }

      .tab {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        padding: var(--spacing-sm) var(--spacing-md);
        background: transparent;
        border: 1px solid var(--surface-border);
        border-radius: var(--radius-sm);
        font-size: 14px;
        font-weight: 500;
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .tab:hover {
        border-color: var(--primary);
        color: var(--primary);
      }

      .tab.active {
        background: var(--primary);
        border-color: var(--primary);
        color: white;
      }

      .tab mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      /* Loading */
      .loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 80px;
        color: var(--text-secondary);
      }

      .loading p {
        margin-top: var(--spacing-md);
      }

      /* Content */
      .content {
        max-width: 900px;
      }

      .section-grid {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-lg);
      }

      /* Settings Card */
      .settings-card {
        background: var(--surface);
        border: 1px solid var(--surface-border);
        border-radius: var(--radius-sm);
        overflow: hidden;
      }

      .settings-card.wide {
        max-width: 100%;
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-md);
        border-bottom: 1px solid var(--surface-border);
        background: var(--supporting);
      }

      .card-title {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
      }

      .card-title mat-icon {
        color: var(--primary);
      }

      .card-title h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--text-primary);
      }

      .card-body {
        padding: var(--spacing-md);
      }

      .card-description {
        color: var(--text-secondary);
        margin: 0 0 var(--spacing-md);
        font-size: 14px;
      }

      .card-actions {
        display: flex;
        gap: var(--spacing-sm);
        margin-top: var(--spacing-md);
        padding-top: var(--spacing-md);
        border-top: 1px solid var(--surface-border);
      }

      /* Profile Display */
      .profile-display {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md);
      }

      .profile-row {
        display: flex;
        align-items: center;
      }

      .profile-label {
        width: 100px;
        font-size: 14px;
        font-weight: 500;
        color: var(--text-secondary);
      }

      .profile-value {
        font-size: 14px;
        color: var(--text-primary);
      }

      /* Profile Edit */
      .profile-edit {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
      }

      .full-width {
        width: 100%;
        max-width: 400px;
      }

      /* Toggle Row */
      .toggle-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: var(--spacing-md);
      }

      .toggle-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .toggle-label {
        font-size: 14px;
        font-weight: 500;
        color: var(--text-primary);
      }

      .toggle-description {
        font-size: 13px;
        color: var(--text-secondary);
      }

      .dev-hint {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        margin-top: var(--spacing-md);
        padding: var(--spacing-sm) var(--spacing-md);
        background: var(--primary-ghost);
        border-radius: var(--radius-sm);
        font-size: 13px;
        color: var(--text-secondary);
      }

      .dev-hint mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: var(--primary);
      }

      /* Credentials */
      .credentials-grid {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md);
      }

      .credential-item {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xs);
      }

      .credential-label {
        font-size: 12px;
        font-weight: 500;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .credential-value {
        display: flex;
        align-items: center;
        background: var(--supporting);
        border: 1px solid var(--surface-border);
        border-radius: var(--radius-sm);
        padding: var(--spacing-sm) var(--spacing-md);
      }

      .credential-value code {
        flex: 1;
        font-family: 'Fira Code', 'Consolas', monospace;
        font-size: 13px;
        color: var(--text-primary);
        word-break: break-all;
      }

      mat-divider {
        margin: var(--spacing-md) 0;
      }

      .regenerate-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: var(--spacing-md);
      }

      .regenerate-warning {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        font-size: 13px;
        color: var(--danger);
      }

      .regenerate-warning mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      /* Guide */
      .guide-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: var(--spacing-md);
      }

      .guide-item {
        display: flex;
        gap: var(--spacing-md);
        padding: var(--spacing-md);
        background: var(--supporting);
        border-radius: var(--radius-sm);
      }

      .guide-icon {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--primary-ghost);
        border-radius: var(--radius-sm);
        flex-shrink: 0;
      }

      .guide-icon mat-icon {
        color: var(--primary);
      }

      .guide-content h4 {
        margin: 0 0 var(--spacing-xs);
        font-size: 14px;
        font-weight: 600;
        color: var(--text-primary);
      }

      .guide-content p {
        margin: 0;
        font-size: 13px;
        color: var(--text-secondary);
        line-height: 1.5;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .settings {
          padding: var(--spacing-md);
        }

        .toggle-row {
          flex-direction: column;
          align-items: flex-start;
        }

        .regenerate-row {
          flex-direction: column;
          align-items: flex-start;
        }

        .guide-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class SettingsComponent implements OnInit, OnDestroy {
  private readonly snackBar = inject(MatSnackBar);
  private readonly developerApi = inject(DeveloperApiService);
  private readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly destroy$ = new Subject<void>();

  activeTab: 'profile' | 'developer' = 'profile';
  developerSettings: WorkspaceDeveloperSettings = { enabled: false };
  profile: UserProfile | null = null;
  showSecret = false;
  isSaving = false;
  isRegenerating = false;
  isLoading = true;

  // Profile editing
  isEditingProfile = false;
  isSavingProfile = false;
  editName = '';

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async loadData(): Promise<void> {
    this.isLoading = true;
    try {
      // Load user profile
      this.authService.currentUser$
        .pipe(takeUntil(this.destroy$))
        .subscribe((user) => {
          if (user) {
            this.profile = {
              id: '',
              name: user.name,
              email: user.email,
            };
          }
        });

      // Load developer settings
      try {
        this.developerSettings = await firstValueFrom(
          this.developerApi.getWorkspaceDeveloperSettings()
        );
      } catch {
        this.developerSettings = { enabled: false };
      }
    } finally {
      this.isLoading = false;
    }
  }

  // Profile methods
  startEditProfile(): void {
    this.isEditingProfile = true;
    this.editName = this.profile?.name || '';
  }

  cancelEditProfile(): void {
    this.isEditingProfile = false;
    this.editName = '';
  }

  async saveProfile(): Promise<void> {
    if (!this.editName.trim()) {
      this.snackBar.open('Name cannot be empty', 'Close', { duration: 3000 });
      return;
    }

    this.isSavingProfile = true;
    try {
      await firstValueFrom(
        this.http.put<UserProfile>('/api/users/me', {
          name: this.editName.trim(),
        })
      );

      if (this.profile) {
        this.profile.name = this.editName.trim();
      }

      this.isEditingProfile = false;
      this.snackBar.open('Profile updated', 'Close', { duration: 2000 });
    } catch {
      this.snackBar.open('Failed to update profile', 'Close', {
        duration: 3000,
      });
    } finally {
      this.isSavingProfile = false;
    }
  }

  // Developer mode methods
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

      // Switch to profile tab if disabling
      if (!enabled && this.activeTab === 'developer') {
        this.activeTab = 'profile';
      }
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
