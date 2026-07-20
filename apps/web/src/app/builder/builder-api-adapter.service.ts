import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ISurveyBuilderApi, SurveyBuilderRecord } from '@angular-surveys/survey-builder';
import { MWForm } from '@angular-surveys/survey-renderer';
import { SurveyApiService } from '../core/services/survey-api.service';

@Injectable()
export class BuilderApiAdapterService implements ISurveyBuilderApi {
  constructor(private readonly api: SurveyApiService) {}

  getSurvey(id: string): Observable<SurveyBuilderRecord> {
    return this.api.getSurvey(id).pipe(map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      form: s.form,
      status: s.status,
      updatedAt: s.updatedAt,
      shareUrl: s.shareUrl,
    })));
  }

  createSurvey(data: { name: string; description?: string; form: MWForm }): Observable<SurveyBuilderRecord> {
    return this.api.createSurvey(data).pipe(map((s) => ({
      id: s.id, name: s.name, description: s.description,
      form: s.form ?? data.form, status: s.status, updatedAt: s.updatedAt,
    })));
  }

  updateSurvey(id: string, data: { name?: string; description?: string; form?: MWForm }): Observable<SurveyBuilderRecord> {
    return this.api.updateSurvey(id, data).pipe(map((s) => ({
      id: s.id, name: s.name, description: s.description,
      form: s.form ?? data.form ?? this.emptyForm(s.name),
      status: s.status, updatedAt: s.updatedAt,
    })));
  }

  publishSurvey(id: string): Observable<SurveyBuilderRecord> {
    return this.api.publishSurvey(id).pipe(map((s) => ({
      id: s.id, name: s.name, description: s.description,
      form: s.form, status: s.status, updatedAt: s.updatedAt, shareUrl: s.shareUrl,
    })));
  }

  unpublishSurvey(id: string): Observable<SurveyBuilderRecord> {
    return this.api.unpublishSurvey(id).pipe(map((s) => ({
      id: s.id, name: s.name, description: s.description,
      form: s.form, status: s.status, updatedAt: s.updatedAt,
    })));
  }

  private emptyForm(name: string): MWForm {
    return {
      name, description: '', pages: [{
        id: 'page-1', number: 1, name: null, description: null,
        elements: [], pageFlow: { nextPage: true }, namedPage: false,
      }],
    };
  }
}
