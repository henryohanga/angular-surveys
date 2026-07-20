import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { MWForm } from '@angular-surveys/survey-renderer';

export interface SurveyBuilderRecord {
  id: string;
  name: string;
  description?: string;
  form: MWForm;
  status: 'draft' | 'published';
  updatedAt?: string | Date;
  shareUrl?: string;
}

export interface ISurveyBuilderApi {
  getSurvey(id: string): Observable<SurveyBuilderRecord>;
  createSurvey(data: { name: string; description?: string; form: MWForm }): Observable<SurveyBuilderRecord>;
  updateSurvey(id: string, data: { name?: string; description?: string; form?: MWForm }): Observable<SurveyBuilderRecord>;
  publishSurvey(id: string): Observable<SurveyBuilderRecord>;
  unpublishSurvey(id: string): Observable<SurveyBuilderRecord>;
}

export const SURVEY_BUILDER_API = new InjectionToken<ISurveyBuilderApi>('SURVEY_BUILDER_API');
