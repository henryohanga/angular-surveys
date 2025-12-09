/**
 * API Request/Response Types
 */

// Generic API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
  stack?: string; // Only in development
}

export interface ApiMeta {
  timestamp: string;
  requestId: string;
  version: string;
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Survey API DTOs
export interface CreateSurveyDto {
  name: string;
  description?: string;
  templateId?: string;
  workspaceId?: string;
}

export interface UpdateSurveyDto {
  name?: string;
  description?: string;
  form?: import('./survey.types').MWForm;
  settings?: import('./survey.types').SurveySettings;
}

export interface PublishSurveyDto {
  startDate?: string;
  endDate?: string;
  limitResponses?: number;
}

// Response API DTOs
export interface SubmitResponseDto {
  responses: Record<string, unknown>;
  metadata?: {
    startedAt?: string;
    completionTime?: number;
  };
}

export interface SaveProgressDto {
  responses: Record<string, unknown>;
  currentPage: number;
}

// User API DTOs
export interface UpdateUserDto {
  name?: string;
  avatarUrl?: string;
  preferences?: import('./user.types').UserPreferences;
}

export interface InviteUserDto {
  email: string;
  role: import('./user.types').WorkspaceRole;
  workspaceId: string;
}

// Filter/Search
export interface SurveyFilters {
  status?: import('./survey.types').SurveyStatus;
  search?: string;
  createdAfter?: string;
  createdBefore?: string;
  ownerId?: string;
  workspaceId?: string;
}

export interface ResponseFilters {
  surveyId: string;
  submittedAfter?: string;
  submittedBefore?: string;
  isComplete?: boolean;
}

// Health check
export interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'down';
  version: string;
  uptime: number;
  services: {
    database: ServiceStatus;
    cache?: ServiceStatus;
    storage?: ServiceStatus;
  };
}

export interface ServiceStatus {
  status: 'ok' | 'down';
  latency?: number;
  error?: string;
}
