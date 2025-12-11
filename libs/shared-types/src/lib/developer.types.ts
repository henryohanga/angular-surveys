/**
 * Developer Mode Types
 * Types for developer integrations, webhooks, and API access
 */

/**
 * Developer settings for a survey
 */
export interface DeveloperSettings {
  /** Whether developer mode is enabled for this survey */
  enabled: boolean;
  /** API key for this survey (for webhook signature verification) */
  apiKey?: string;
  /** API secret for signing webhook payloads */
  apiSecret?: string;
  /** Custom mapping of question IDs to external/third-party IDs */
  questionMappings?: QuestionMapping[];
  /** Additional metadata fields to include in webhook payloads */
  customMetadataFields?: string[];
}

/**
 * Maps internal question IDs to external/third-party identifiers
 */
export interface QuestionMapping {
  /** Internal question ID */
  questionId: string;
  /** External/third-party identifier */
  externalId: string;
  /** Optional field name for the external system */
  fieldName?: string;
  /** Optional description for documentation */
  description?: string;
}

/**
 * Webhook configuration for a survey
 */
export interface Webhook {
  id: string;
  surveyId: string;
  /** Webhook URL to POST to */
  url: string;
  /** Human-readable name for the webhook */
  name: string;
  /** Optional description */
  description?: string;
  /** Whether this webhook is active */
  isActive: boolean;
  /** Events that trigger this webhook */
  events: WebhookEvent[];
  /** Custom headers to include in the request */
  headers?: Record<string, string>;
  /** Whether to include respondent metadata */
  includeMetadata: boolean;
  /** Whether to use question mappings in payload */
  useQuestionMappings: boolean;
  /** Secret for HMAC signature (auto-generated) */
  secret: string;
  /** Number of retry attempts for failed deliveries */
  retryCount: number;
  /** Maximum retry attempts allowed */
  maxRetries: number;
  createdAt: Date;
  updatedAt: Date;
}

export type WebhookEvent =
  | 'response.submitted'
  | 'response.updated'
  | 'response.deleted'
  | 'survey.published'
  | 'survey.unpublished';

/**
 * Webhook delivery log entry
 */
export interface WebhookLog {
  id: string;
  webhookId: string;
  responseId?: string;
  surveyId: string;
  /** The event that triggered this delivery */
  event: WebhookEvent;
  /** URL the webhook was sent to */
  url: string;
  /** HTTP method used */
  method: 'POST';
  /** Request headers sent */
  requestHeaders: Record<string, string>;
  /** Request body sent */
  requestBody: string;
  /** HTTP status code received */
  statusCode?: number;
  /** Response body received */
  responseBody?: string;
  /** Response headers received */
  responseHeaders?: Record<string, string>;
  /** Whether the delivery was successful */
  success: boolean;
  /** Error message if failed */
  error?: string;
  /** Number of delivery attempts made */
  attempt: number;
  /** Whether this can be retried */
  canRetry: boolean;
  /** Time taken for the request in ms */
  duration?: number;
  /** When the delivery was attempted */
  createdAt: Date;
  /** When the next retry will be attempted */
  nextRetryAt?: Date;
}

/**
 * Webhook delivery status summary
 */
export interface WebhookDeliveryStatus {
  webhookId: string;
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  pendingRetries: number;
  lastDeliveryAt?: Date;
  lastSuccessAt?: Date;
  lastFailureAt?: Date;
  successRate: number;
}

/**
 * Payload sent to webhook endpoints
 */
export interface WebhookPayload {
  /** Unique ID for this delivery */
  deliveryId: string;
  /** Event type */
  event: WebhookEvent;
  /** Timestamp of the event */
  timestamp: string;
  /** Survey information */
  survey: {
    id: string;
    name: string;
    status: string;
  };
  /** Response data (for response events) */
  response?: {
    id: string;
    submittedAt: string;
    completedAt?: string;
    isComplete: boolean;
    /** Answers keyed by question ID or external ID if mappings enabled */
    answers: Record<string, unknown>;
    /** Response metadata if enabled */
    metadata?: Record<string, unknown>;
  };
  /** Question mappings if enabled */
  questionMappings?: QuestionMapping[];
}

/**
 * DTO for creating a webhook
 */
export interface CreateWebhookDto {
  url: string;
  name: string;
  description?: string;
  events: WebhookEvent[];
  headers?: Record<string, string>;
  includeMetadata?: boolean;
  useQuestionMappings?: boolean;
}

/**
 * DTO for updating a webhook
 */
export interface UpdateWebhookDto {
  url?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
  events?: WebhookEvent[];
  headers?: Record<string, string>;
  includeMetadata?: boolean;
  useQuestionMappings?: boolean;
}

/**
 * DTO for updating developer settings
 */
export interface UpdateDeveloperSettingsDto {
  enabled?: boolean;
  questionMappings?: QuestionMapping[];
  customMetadataFields?: string[];
}

/**
 * API response for webhook test
 */
export interface WebhookTestResult {
  success: boolean;
  statusCode?: number;
  responseTime?: number;
  error?: string;
  responseBody?: string;
}
