import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { DeveloperSettingsComponent } from '../developer-settings/developer-settings.component';
import { WebhookManagementComponent } from '../webhook-management/webhook-management.component';

export interface DeveloperPanelData {
  surveyId: string;
}

@Component({
  selector: 'app-developer-panel',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    DeveloperSettingsComponent,
    WebhookManagementComponent,
  ],
  template: `
    <div class="developer-panel">
      <div class="panel-header">
        <div class="header-title">
          <mat-icon>code</mat-icon>
          <h2>Developer Tools</h2>
        </div>
        <button mat-icon-button (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-tab-group class="developer-tabs" animationDuration="200ms">
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>settings</mat-icon>
            <span>Settings & Mappings</span>
          </ng-template>
          <div class="tab-content">
            <app-developer-settings></app-developer-settings>
          </div>
        </mat-tab>

        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>webhook</mat-icon>
            <span>Webhooks</span>
          </ng-template>
          <div class="tab-content">
            <app-webhook-management
              [surveyId]="data.surveyId"
            ></app-webhook-management>
          </div>
        </mat-tab>

        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>menu_book</mat-icon>
            <span>Documentation</span>
          </ng-template>
          <div class="tab-content">
            <div class="documentation">
              <h3>Developer Integration Guide</h3>

              <section class="doc-section">
                <h4>
                  <mat-icon>vpn_key</mat-icon>
                  Authentication
                </h4>
                <p>
                  API credentials are managed at the workspace level in your
                  <a routerLink="/settings" (click)="close()">Settings</a>. Use
                  these to verify webhook signatures.
                </p>
                <div class="code-block">
                  <code>
                    // Verify webhook signature<br />
                    const signature = req.headers['x-webhook-signature'];<br />
                    const [timestamp, hash] = parseSignature(signature);<br />
                    const expectedHash = hmacSha256(apiSecret, timestamp + '.' +
                    body);
                  </code>
                </div>
              </section>

              <section class="doc-section">
                <h4>
                  <mat-icon>swap_horiz</mat-icon>
                  Question Mappings
                </h4>
                <p>
                  Map internal question IDs to your own identifiers. When
                  enabled, webhook payloads will use your custom field names
                  instead of internal IDs.
                </p>
                <div class="code-block">
                  <code>
                    // Without mappings<br />
                    &#123; "q-1234567890": "John Doe" &#125;<br />
                    <br />
                    // With mappings (externalId: "customer_name")<br />
                    &#123; "customer_name": "John Doe" &#125;
                  </code>
                </div>
              </section>

              <section class="doc-section">
                <h4>
                  <mat-icon>webhook</mat-icon>
                  Webhook Payload
                </h4>
                <p>
                  Webhooks send POST requests with JSON payloads containing
                  survey and response data.
                </p>
                <div class="code-block">
                  <code>
                    &#123;<br />
                    &nbsp;&nbsp;"deliveryId": "uuid",<br />
                    &nbsp;&nbsp;"event": "response.submitted",<br />
                    &nbsp;&nbsp;"timestamp": "2024-01-15T10:30:00Z",<br />
                    &nbsp;&nbsp;"survey": &#123;<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;"id": "survey-id",<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;"name": "Customer Feedback"<br />
                    &nbsp;&nbsp;&#125;,<br />
                    &nbsp;&nbsp;"response": &#123;<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;"id": "response-id",<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;"submittedAt":
                    "2024-01-15T10:30:00Z",<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;"answers": &#123; ... &#125;<br />
                    &nbsp;&nbsp;&#125;<br />
                    &#125;
                  </code>
                </div>
              </section>

              <section class="doc-section">
                <h4>
                  <mat-icon>security</mat-icon>
                  Security Headers
                </h4>
                <p>Each webhook request includes these headers:</p>
                <ul>
                  <li>
                    <strong>X-Webhook-Signature</strong> - HMAC signature for
                    verification
                  </li>
                  <li>
                    <strong>X-Webhook-Event</strong> - Event type (e.g.,
                    response.submitted)
                  </li>
                  <li>
                    <strong>X-Webhook-Delivery</strong> - Unique delivery ID
                  </li>
                  <li><strong>Content-Type</strong> - application/json</li>
                </ul>
              </section>

              <section class="doc-section">
                <h4>
                  <mat-icon>refresh</mat-icon>
                  Retry Policy
                </h4>
                <p>
                  Failed webhook deliveries are automatically retried up to 3
                  times with exponential backoff:
                </p>
                <ul>
                  <li>1st retry: 1 minute after failure</li>
                  <li>2nd retry: 5 minutes after 1st retry</li>
                  <li>3rd retry: 15 minutes after 2nd retry</li>
                </ul>
                <p>
                  You can also manually retry failed deliveries from the webhook
                  logs.
                </p>
              </section>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [
    `
      .developer-panel {
        width: 900px;
        max-width: 95vw;
        max-height: 85vh;
        display: flex;
        flex-direction: column;
      }

      .panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 24px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      .header-title {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .header-title h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 500;
      }

      .panel-header button {
        color: white;
      }

      .developer-tabs {
        flex: 1;
        overflow: hidden;
      }

      ::ng-deep .developer-tabs .mat-mdc-tab-labels {
        background: rgba(0, 0, 0, 0.02);
      }

      ::ng-deep .developer-tabs .mat-mdc-tab {
        min-width: 140px;
      }

      ::ng-deep .developer-tabs .mat-mdc-tab .mdc-tab__content {
        gap: 8px;
      }

      .tab-content {
        height: calc(85vh - 140px);
        overflow-y: auto;
        padding: 8px;
      }

      .documentation {
        padding: 16px;
        max-width: 700px;
      }

      .documentation h3 {
        margin: 0 0 24px 0;
        font-size: 22px;
      }

      .doc-section {
        margin-bottom: 28px;
      }

      .doc-section h4 {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0 0 12px 0;
        font-size: 16px;
        color: #333;
      }

      .doc-section h4 mat-icon {
        color: #667eea;
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      .doc-section p {
        color: rgba(0, 0, 0, 0.7);
        line-height: 1.6;
        margin: 0 0 12px 0;
      }

      .doc-section ul {
        margin: 0;
        padding-left: 20px;
        color: rgba(0, 0, 0, 0.7);
      }

      .doc-section li {
        margin-bottom: 6px;
        line-height: 1.5;
      }

      .code-block {
        background: #1e1e1e;
        color: #d4d4d4;
        padding: 16px;
        border-radius: 8px;
        overflow-x: auto;
        font-family: 'Fira Code', 'Consolas', monospace;
        font-size: 13px;
        line-height: 1.5;
      }

      .code-block code {
        white-space: pre-wrap;
        word-break: break-word;
      }

      @media (max-width: 768px) {
        .developer-panel {
          width: 100%;
        }

        .tab-content {
          height: calc(85vh - 160px);
        }
      }
    `,
  ],
})
export class DeveloperPanelComponent {
  private readonly dialogRef = inject(MatDialogRef<DeveloperPanelComponent>);
  protected readonly data: DeveloperPanelData = inject(MAT_DIALOG_DATA);

  close(): void {
    this.dialogRef.close();
  }
}
