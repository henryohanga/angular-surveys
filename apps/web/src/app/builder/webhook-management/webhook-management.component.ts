import { Component, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { Subject, firstValueFrom } from 'rxjs';
import {
  DeveloperApiService,
  Webhook,
  WebhookLog,
  WebhookEvent,
  WebhookDeliveryStatus,
} from '../../core/services/developer-api.service';

@Component({
  selector: 'app-webhook-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatExpansionModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDividerModule,
    MatChipsModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatMenuModule,
    MatBadgeModule,
  ],
  template: `
    <div class="webhook-management">
      <mat-card class="webhooks-card">
        <mat-card-header>
          <mat-icon mat-card-avatar>webhook</mat-icon>
          <mat-card-title>Webhooks</mat-card-title>
          <mat-card-subtitle>
            Configure webhook endpoints to receive survey responses
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <!-- Add Webhook Form -->
          @if (showAddForm) {
          <div class="add-webhook-form">
            <h3>{{ editingWebhook ? 'Edit Webhook' : 'Add New Webhook' }}</h3>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Name</mat-label>
              <input
                matInput
                [(ngModel)]="webhookForm.name"
                placeholder="My Webhook"
              />
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>URL</mat-label>
              <input
                matInput
                [(ngModel)]="webhookForm.url"
                placeholder="https://api.example.com/webhook"
              />
              <mat-hint>The endpoint that will receive POST requests</mat-hint>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description (optional)</mat-label>
              <textarea
                matInput
                [(ngModel)]="webhookForm.description"
                rows="2"
              ></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Events</mat-label>
              <mat-select [(ngModel)]="webhookForm.events" multiple>
                <mat-option value="response.submitted"
                  >Response Submitted</mat-option
                >
                <mat-option value="response.updated"
                  >Response Updated</mat-option
                >
                <mat-option value="response.deleted"
                  >Response Deleted</mat-option
                >
                <mat-option value="survey.published"
                  >Survey Published</mat-option
                >
                <mat-option value="survey.unpublished"
                  >Survey Unpublished</mat-option
                >
              </mat-select>
            </mat-form-field>

            <div class="toggle-row">
              <mat-slide-toggle
                [(ngModel)]="webhookForm.includeMetadata"
                color="primary"
              >
                Include response metadata
              </mat-slide-toggle>
            </div>

            <div class="toggle-row">
              <mat-slide-toggle
                [(ngModel)]="webhookForm.useQuestionMappings"
                color="primary"
              >
                Use question mappings in payload
              </mat-slide-toggle>
            </div>

            <div class="form-actions">
              <button mat-button (click)="cancelForm()">Cancel</button>
              <button
                mat-raised-button
                color="primary"
                (click)="saveWebhook()"
                [disabled]="isSaving || !webhookForm.name || !webhookForm.url"
              >
                {{
                  isSaving ? 'Saving...' : editingWebhook ? 'Update' : 'Create'
                }}
              </button>
            </div>
          </div>
          } @else {
          <button
            mat-stroked-button
            color="primary"
            (click)="showAddForm = true"
          >
            <mat-icon>add</mat-icon>
            Add Webhook
          </button>
          }

          <mat-divider class="section-divider"></mat-divider>

          <!-- Webhooks List -->
          @if (isLoading) {
          <div class="loading-state">
            <mat-spinner diameter="40"></mat-spinner>
            <p>Loading webhooks...</p>
          </div>
          } @else if (webhooks.length === 0) {
          <div class="empty-state">
            <mat-icon>webhook</mat-icon>
            <h3>No webhooks configured</h3>
            <p>
              Add a webhook to receive real-time notifications when responses
              are submitted.
            </p>
          </div>
          } @else {
          <div class="webhooks-list">
            @for (webhook of webhooks; track webhook.id) {
            <mat-expansion-panel class="webhook-panel">
              <mat-expansion-panel-header>
                <mat-panel-title>
                  <div class="webhook-title">
                    <span
                      class="status-dot"
                      [class.active]="webhook.isActive"
                      [matTooltip]="webhook.isActive ? 'Active' : 'Inactive'"
                    ></span>
                    {{ webhook.name }}
                  </div>
                </mat-panel-title>
                <mat-panel-description>
                  <span class="webhook-url">{{ webhook.url }}</span>
                </mat-panel-description>
              </mat-expansion-panel-header>

              <div class="webhook-details">
                <div class="detail-section">
                  <h4>Configuration</h4>
                  <div class="detail-row">
                    <span class="label">Events:</span>
                    <div class="events-chips">
                      @for (event of webhook.events; track event) {
                      <span class="event-chip">{{
                        formatEventName(event)
                      }}</span>
                      }
                    </div>
                  </div>
                  <div class="detail-row">
                    <span class="label">Include Metadata:</span>
                    <span>{{ webhook.includeMetadata ? 'Yes' : 'No' }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Use Question Mappings:</span>
                    <span>{{
                      webhook.useQuestionMappings ? 'Yes' : 'No'
                    }}</span>
                  </div>
                </div>

                <div class="detail-section">
                  <h4>Secret</h4>
                  <div class="secret-row">
                    <code class="secret-value">{{
                      showSecrets[webhook.id]
                        ? webhook.secret
                        : '••••••••••••••••'
                    }}</code>
                    <button
                      mat-icon-button
                      (click)="toggleSecret(webhook.id)"
                      matTooltip="Toggle visibility"
                    >
                      <mat-icon>{{
                        showSecrets[webhook.id]
                          ? 'visibility_off'
                          : 'visibility'
                      }}</mat-icon>
                    </button>
                    <button
                      mat-icon-button
                      (click)="copySecret(webhook.secret)"
                      matTooltip="Copy to clipboard"
                    >
                      <mat-icon>content_copy</mat-icon>
                    </button>
                    <button
                      mat-icon-button
                      (click)="regenerateSecret(webhook)"
                      matTooltip="Regenerate secret"
                      color="warn"
                    >
                      <mat-icon>refresh</mat-icon>
                    </button>
                  </div>
                </div>

                @if (deliveryStatuses[webhook.id]) {
                <div class="detail-section">
                  <h4>Delivery Statistics</h4>
                  <div class="stats-grid">
                    <div class="stat-card">
                      <span class="stat-value">{{
                        deliveryStatuses[webhook.id].totalDeliveries
                      }}</span>
                      <span class="stat-label">Total</span>
                    </div>
                    <div class="stat-card success">
                      <span class="stat-value">{{
                        deliveryStatuses[webhook.id].successfulDeliveries
                      }}</span>
                      <span class="stat-label">Successful</span>
                    </div>
                    <div class="stat-card error">
                      <span class="stat-value">{{
                        deliveryStatuses[webhook.id].failedDeliveries
                      }}</span>
                      <span class="stat-label">Failed</span>
                    </div>
                    <div class="stat-card warning">
                      <span class="stat-value">{{
                        deliveryStatuses[webhook.id].pendingRetries
                      }}</span>
                      <span class="stat-label">Pending</span>
                    </div>
                  </div>
                </div>
                }

                <div class="webhook-actions">
                  <button mat-stroked-button (click)="testWebhook(webhook)">
                    <mat-icon>play_arrow</mat-icon>
                    Test
                  </button>
                  <button mat-stroked-button (click)="viewLogs(webhook)">
                    <mat-icon>history</mat-icon>
                    View Logs
                  </button>
                  <button mat-stroked-button (click)="editWebhook(webhook)">
                    <mat-icon>edit</mat-icon>
                    Edit
                  </button>
                  <mat-slide-toggle
                    [checked]="webhook.isActive"
                    (change)="toggleWebhookActive(webhook, $event.checked)"
                    color="primary"
                  >
                    {{ webhook.isActive ? 'Active' : 'Inactive' }}
                  </mat-slide-toggle>
                  <button
                    mat-icon-button
                    color="warn"
                    (click)="deleteWebhook(webhook)"
                  >
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </div>
            </mat-expansion-panel>
            }
          </div>
          }

          <!-- Webhook Logs Section -->
          @if (showLogs && selectedWebhook) {
          <mat-divider class="section-divider"></mat-divider>
          <div class="logs-section">
            <div class="logs-header">
              <h3>
                <mat-icon>history</mat-icon>
                Delivery Logs - {{ selectedWebhook.name }}
              </h3>
              <button mat-icon-button (click)="closeLogs()">
                <mat-icon>close</mat-icon>
              </button>
            </div>

            @if (isLoadingLogs) {
            <div class="loading-state">
              <mat-spinner diameter="32"></mat-spinner>
            </div>
            } @else if (logs.length === 0) {
            <div class="empty-state small">
              <mat-icon>inbox</mat-icon>
              <p>No delivery logs yet</p>
            </div>
            } @else {
            <div class="logs-list">
              @for (log of logs; track log.id) {
              <div
                class="log-entry"
                [class.success]="log.success"
                [class.error]="!log.success"
              >
                <div class="log-header">
                  <mat-icon>{{
                    log.success ? 'check_circle' : 'error'
                  }}</mat-icon>
                  <span class="log-event">{{
                    formatEventName(log.event)
                  }}</span>
                  <span class="log-status">
                    {{ log.statusCode ? 'HTTP ' + log.statusCode : 'Failed' }}
                  </span>
                  @if (log.duration) {
                  <span class="log-duration"> {{ log.duration }}ms </span>
                  }
                  <span class="log-time">{{ formatDate(log.createdAt) }}</span>
                </div>
                @if (log.error) {
                <div class="log-error">{{ log.error }}</div>
                }
                <div class="log-actions">
                  @if (log.canRetry) {
                  <button
                    mat-stroked-button
                    size="small"
                    (click)="retryLog(log)"
                  >
                    <mat-icon>refresh</mat-icon>
                    Retry
                  </button>
                  }
                </div>
              </div>
              }
            </div>
            }
          </div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .webhook-management {
        padding: 16px;
      }

      .webhooks-card {
        max-width: 900px;
      }

      .webhooks-card mat-card-header {
        margin-bottom: 16px;
      }

      .webhooks-card mat-icon[mat-card-avatar] {
        background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
        color: white;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .add-webhook-form {
        background: rgba(0, 0, 0, 0.02);
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 16px;
      }

      .add-webhook-form h3 {
        margin: 0 0 16px 0;
      }

      .full-width {
        width: 100%;
      }

      .toggle-row {
        margin: 12px 0;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 16px;
      }

      .section-divider {
        margin: 24px 0;
      }

      .loading-state,
      .empty-state {
        text-align: center;
        padding: 40px 20px;
        color: rgba(0, 0, 0, 0.5);
      }

      .empty-state mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        margin-bottom: 16px;
      }

      .empty-state.small {
        padding: 20px;
      }

      .empty-state.small mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
      }

      .webhooks-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .webhook-panel {
        border: 1px solid rgba(0, 0, 0, 0.08);
      }

      .webhook-title {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #9e9e9e;
      }

      .status-dot.active {
        background: #4caf50;
      }

      .webhook-url {
        font-family: monospace;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.5);
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .webhook-details {
        padding: 16px 0;
      }

      .detail-section {
        margin-bottom: 20px;
      }

      .detail-section h4 {
        margin: 0 0 12px 0;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.6);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .detail-row {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 8px;
      }

      .detail-row .label {
        font-weight: 500;
        min-width: 150px;
      }

      .events-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .event-chip {
        background: rgba(0, 0, 0, 0.08);
        padding: 4px 10px;
        border-radius: 16px;
        font-size: 12px;
      }

      .secret-row {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .secret-value {
        background: rgba(0, 0, 0, 0.05);
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 13px;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
      }

      .stat-card {
        background: rgba(0, 0, 0, 0.03);
        padding: 12px;
        border-radius: 8px;
        text-align: center;
      }

      .stat-card.success {
        background: rgba(76, 175, 80, 0.1);
      }

      .stat-card.error {
        background: rgba(244, 67, 54, 0.1);
      }

      .stat-card.warning {
        background: rgba(255, 152, 0, 0.1);
      }

      .stat-value {
        display: block;
        font-size: 24px;
        font-weight: 600;
      }

      .stat-label {
        display: block;
        font-size: 11px;
        color: rgba(0, 0, 0, 0.5);
        text-transform: uppercase;
      }

      .webhook-actions {
        display: flex;
        align-items: center;
        gap: 12px;
        padding-top: 16px;
        border-top: 1px solid rgba(0, 0, 0, 0.08);
      }

      .logs-section {
        background: rgba(0, 0, 0, 0.02);
        padding: 16px;
        border-radius: 8px;
      }

      .logs-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
      }

      .logs-header h3 {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0;
      }

      .logs-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .log-entry {
        background: white;
        padding: 12px;
        border-radius: 6px;
        border-left: 3px solid #9e9e9e;
      }

      .log-entry.success {
        border-left-color: #4caf50;
      }

      .log-entry.error {
        border-left-color: #f44336;
      }

      .log-header {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .log-header mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      .log-entry.success .log-header mat-icon {
        color: #4caf50;
      }

      .log-entry.error .log-header mat-icon {
        color: #f44336;
      }

      .log-event {
        font-weight: 500;
      }

      .log-status {
        font-family: monospace;
        font-size: 12px;
        background: rgba(0, 0, 0, 0.08);
        padding: 2px 6px;
        border-radius: 4px;
      }

      .log-duration {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.5);
      }

      .log-time {
        margin-left: auto;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.5);
      }

      .log-error {
        margin-top: 8px;
        padding: 8px;
        background: rgba(244, 67, 54, 0.1);
        border-radius: 4px;
        font-size: 13px;
        color: #c62828;
      }

      .log-actions {
        margin-top: 8px;
      }

      @media (max-width: 768px) {
        .stats-grid {
          grid-template-columns: repeat(2, 1fr);
        }

        .webhook-actions {
          flex-wrap: wrap;
        }
      }
    `,
  ],
})
export class WebhookManagementComponent implements OnInit, OnDestroy {
  @Input() surveyId!: string;

  private readonly snackBar = inject(MatSnackBar);
  private readonly developerApi = inject(DeveloperApiService);
  private readonly destroy$ = new Subject<void>();

  webhooks: Webhook[] = [];
  logs: WebhookLog[] = [];
  deliveryStatuses: Record<string, WebhookDeliveryStatus> = {};
  showSecrets: Record<string, boolean> = {};

  isLoading = true;
  isSaving = false;
  isLoadingLogs = false;
  showAddForm = false;
  showLogs = false;
  editingWebhook: Webhook | null = null;
  selectedWebhook: Webhook | null = null;

  webhookForm: {
    name: string;
    url: string;
    description: string;
    events: WebhookEvent[];
    includeMetadata: boolean;
    useQuestionMappings: boolean;
  } = {
    name: '',
    url: '',
    description: '',
    events: ['response.submitted'],
    includeMetadata: true,
    useQuestionMappings: false,
  };

  ngOnInit(): void {
    this.loadWebhooks();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async loadWebhooks(): Promise<void> {
    if (!this.surveyId) return;

    this.isLoading = true;
    try {
      this.webhooks = await firstValueFrom(
        this.developerApi.getWebhooks(this.surveyId)
      );

      // Load delivery statuses for each webhook
      for (const webhook of this.webhooks) {
        this.loadDeliveryStatus(webhook.id);
      }
    } catch {
      this.snackBar.open('Failed to load webhooks', 'Close', {
        duration: 3000,
      });
    } finally {
      this.isLoading = false;
    }
  }

  async loadDeliveryStatus(webhookId: string): Promise<void> {
    try {
      const status = await firstValueFrom(
        this.developerApi.getDeliveryStatus(webhookId)
      );
      this.deliveryStatuses[webhookId] = status;
    } catch {
      // Ignore errors for individual status loads
    }
  }

  async saveWebhook(): Promise<void> {
    if (!this.webhookForm.name || !this.webhookForm.url) return;

    this.isSaving = true;
    try {
      if (this.editingWebhook) {
        await firstValueFrom(
          this.developerApi.updateWebhook(this.editingWebhook.id, {
            name: this.webhookForm.name,
            url: this.webhookForm.url,
            description: this.webhookForm.description || undefined,
            events: this.webhookForm.events,
            includeMetadata: this.webhookForm.includeMetadata,
            useQuestionMappings: this.webhookForm.useQuestionMappings,
          })
        );
        this.snackBar.open('Webhook updated', 'Close', { duration: 2000 });
      } else {
        await firstValueFrom(
          this.developerApi.createWebhook(this.surveyId, {
            name: this.webhookForm.name,
            url: this.webhookForm.url,
            description: this.webhookForm.description || undefined,
            events: this.webhookForm.events,
            includeMetadata: this.webhookForm.includeMetadata,
            useQuestionMappings: this.webhookForm.useQuestionMappings,
          })
        );
        this.snackBar.open('Webhook created', 'Close', { duration: 2000 });
      }

      this.cancelForm();
      this.loadWebhooks();
    } catch {
      this.snackBar.open('Failed to save webhook', 'Close', { duration: 3000 });
    } finally {
      this.isSaving = false;
    }
  }

  editWebhook(webhook: Webhook): void {
    this.editingWebhook = webhook;
    this.webhookForm = {
      name: webhook.name,
      url: webhook.url,
      description: webhook.description || '',
      events: [...webhook.events],
      includeMetadata: webhook.includeMetadata,
      useQuestionMappings: webhook.useQuestionMappings,
    };
    this.showAddForm = true;
  }

  cancelForm(): void {
    this.showAddForm = false;
    this.editingWebhook = null;
    this.webhookForm = {
      name: '',
      url: '',
      description: '',
      events: ['response.submitted'],
      includeMetadata: true,
      useQuestionMappings: false,
    };
  }

  async deleteWebhook(webhook: Webhook): Promise<void> {
    if (!confirm(`Delete webhook "${webhook.name}"?`)) return;

    try {
      await firstValueFrom(this.developerApi.deleteWebhook(webhook.id));
      this.snackBar.open('Webhook deleted', 'Close', { duration: 2000 });
      this.loadWebhooks();
    } catch {
      this.snackBar.open('Failed to delete webhook', 'Close', {
        duration: 3000,
      });
    }
  }

  async toggleWebhookActive(
    webhook: Webhook,
    isActive: boolean
  ): Promise<void> {
    try {
      await firstValueFrom(
        this.developerApi.updateWebhook(webhook.id, { isActive })
      );
      webhook.isActive = isActive;
      this.snackBar.open(
        `Webhook ${isActive ? 'activated' : 'deactivated'}`,
        'Close',
        { duration: 2000 }
      );
    } catch {
      this.snackBar.open('Failed to update webhook', 'Close', {
        duration: 3000,
      });
    }
  }

  async testWebhook(webhook: Webhook): Promise<void> {
    this.snackBar.open('Testing webhook...', undefined, { duration: 0 });

    try {
      const result = await firstValueFrom(
        this.developerApi.testWebhook(webhook.id)
      );

      if (result.success) {
        this.snackBar.open(
          `Test successful! HTTP ${result.statusCode} in ${result.responseTime}ms`,
          'Close',
          { duration: 4000 }
        );
      } else {
        this.snackBar.open(`Test failed: ${result.error}`, 'Close', {
          duration: 5000,
        });
      }

      this.loadDeliveryStatus(webhook.id);
    } catch {
      this.snackBar.open('Failed to test webhook', 'Close', { duration: 3000 });
    }
  }

  async regenerateSecret(webhook: Webhook): Promise<void> {
    if (
      !confirm('Regenerate secret? This will invalidate existing integrations.')
    )
      return;

    try {
      const updated = await firstValueFrom(
        this.developerApi.regenerateSecret(webhook.id)
      );
      webhook.secret = updated.secret;
      this.snackBar.open('Secret regenerated', 'Close', { duration: 2000 });
    } catch {
      this.snackBar.open('Failed to regenerate secret', 'Close', {
        duration: 3000,
      });
    }
  }

  toggleSecret(webhookId: string): void {
    this.showSecrets[webhookId] = !this.showSecrets[webhookId];
  }

  copySecret(secret: string): void {
    navigator.clipboard.writeText(secret);
    this.snackBar.open('Secret copied to clipboard', 'Close', {
      duration: 2000,
    });
  }

  async viewLogs(webhook: Webhook): Promise<void> {
    this.selectedWebhook = webhook;
    this.showLogs = true;
    this.isLoadingLogs = true;

    try {
      const result = await firstValueFrom(
        this.developerApi.getWebhookLogs(webhook.id)
      );
      this.logs = result.logs;
    } catch {
      this.snackBar.open('Failed to load logs', 'Close', { duration: 3000 });
    } finally {
      this.isLoadingLogs = false;
    }
  }

  closeLogs(): void {
    this.showLogs = false;
    this.selectedWebhook = null;
    this.logs = [];
  }

  async retryLog(log: WebhookLog): Promise<void> {
    try {
      await firstValueFrom(this.developerApi.retryDelivery(log.id));
      this.snackBar.open('Retry initiated', 'Close', { duration: 2000 });

      if (this.selectedWebhook) {
        this.viewLogs(this.selectedWebhook);
      }
    } catch {
      this.snackBar.open('Failed to retry delivery', 'Close', {
        duration: 3000,
      });
    }
  }

  formatEventName(event: WebhookEvent): string {
    const names: Record<WebhookEvent, string> = {
      'response.submitted': 'Response Submitted',
      'response.updated': 'Response Updated',
      'response.deleted': 'Response Deleted',
      'survey.published': 'Survey Published',
      'survey.unpublished': 'Survey Unpublished',
    };
    return names[event] || event;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleString();
  }
}
