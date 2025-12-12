import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MWForm } from '../../surveys/models';

export interface ApiSurvey {
  id: string;
  name: string;
  description?: string;
  form: MWForm;
  status: 'draft' | 'published';
  ownerId?: string;
  responseCount: number;
  shareUrl?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse {
  id: string;
  surveyId: string;
  answers: Record<string, unknown>;
  submittedAt: string;
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    referrer?: string;
  };
}

export interface CreateSurveyDto {
  name: string;
  description?: string;
  form?: MWForm;
}

export interface UpdateSurveyDto {
  name?: string;
  description?: string;
  form?: MWForm;
  status?: 'draft' | 'published';
}

export interface SubmitResponseDto {
  responses: Record<string, unknown>;
  completionTime?: number;
}

export interface SurveyAnalytics {
  totalResponses: number;
  completionRate: number;
  averageTimeToComplete: number;
  responsesByDate: { date: string; count: number }[];
  questionAnalytics: {
    questionId: string;
    questionText: string;
    responseCount: number;
    answers: { value: string; count: number; percentage: number }[];
  }[];
}

@Injectable({
  providedIn: 'root',
})
export class SurveyApiService {
  constructor(private http: HttpClient) {}

  // ==================== SURVEYS ====================

  getAllSurveys(): Observable<ApiSurvey[]> {
    return this.http.get<ApiSurvey[]>(`/surveys`);
  }

  getSurvey(id: string): Observable<ApiSurvey> {
    return this.http.get<ApiSurvey>(`/surveys/${id}`);
  }

  getPublicSurvey(id: string): Observable<ApiSurvey> {
    return this.http.get<ApiSurvey>(`/surveys/${id}/public`);
  }

  createSurvey(data: CreateSurveyDto): Observable<ApiSurvey> {
    return this.http.post<ApiSurvey>(`/surveys`, data);
  }

  updateSurvey(id: string, data: UpdateSurveyDto): Observable<ApiSurvey> {
    return this.http.put<ApiSurvey>(`/surveys/${id}`, data);
  }

  publishSurvey(id: string): Observable<ApiSurvey> {
    return this.http.post<ApiSurvey>(`/surveys/${id}/publish`, {});
  }

  unpublishSurvey(id: string): Observable<ApiSurvey> {
    return this.http.post<ApiSurvey>(`/surveys/${id}/unpublish`, {});
  }

  duplicateSurvey(id: string): Observable<ApiSurvey> {
    return this.http.post<ApiSurvey>(`/surveys/${id}/duplicate`, {});
  }

  deleteSurvey(id: string): Observable<void> {
    return this.http.delete<void>(`/surveys/${id}`);
  }

  // ==================== RESPONSES ====================

  submitResponse(
    surveyId: string,
    data: SubmitResponseDto
  ): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`/responses/${surveyId}`, data);
  }

  getResponses(surveyId: string): Observable<ApiResponse[]> {
    return this.http.get<ApiResponse[]>(`/responses/survey/${surveyId}`);
  }

  getAnalytics(surveyId: string): Observable<SurveyAnalytics> {
    return this.http.get<SurveyAnalytics>(
      `/responses/survey/${surveyId}/analytics`
    );
  }

  getResponse(id: string): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`/responses/${id}`);
  }

  deleteResponse(id: string): Observable<void> {
    return this.http.delete<void>(`/responses/${id}`);
  }

  // ==================== HELPERS ====================

  /**
   * Convert API survey to local Survey format for compatibility
   */
  toLocalSurvey(apiSurvey: ApiSurvey): {
    id: string;
    form: MWForm;
    status: 'draft' | 'published';
    createdAt: Date;
    updatedAt: Date;
    publishedAt?: Date;
    shareUrl?: string;
    responseCount: number;
  } {
    return {
      id: apiSurvey.id,
      form: apiSurvey.form,
      status: apiSurvey.status,
      createdAt: new Date(apiSurvey.createdAt),
      updatedAt: new Date(apiSurvey.updatedAt),
      publishedAt: apiSurvey.publishedAt
        ? new Date(apiSurvey.publishedAt)
        : undefined,
      shareUrl: apiSurvey.shareUrl,
      responseCount: apiSurvey.responseCount || 0,
    };
  }

  /**
   * Convert API response to local SurveyResponse format
   */
  toLocalResponse(apiResponse: ApiResponse): {
    id: string;
    surveyId: string;
    responses: Record<string, unknown>;
    submittedAt: Date;
    metadata?: {
      userAgent?: string;
      ipAddress?: string;
    };
  } {
    return {
      id: apiResponse.id,
      surveyId: apiResponse.surveyId,
      responses: apiResponse.answers,
      submittedAt: new Date(apiResponse.submittedAt),
      metadata: apiResponse.metadata,
    };
  }
}
