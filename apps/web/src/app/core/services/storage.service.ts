import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MWForm } from '../../surveys/models';

export interface Survey {
  id: string;
  form: MWForm;
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  shareUrl?: string;
  responseCount: number;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  responses: Record<string, unknown>;
  submittedAt: Date;
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
  };
}

export interface SurveyTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  form: MWForm;
  isCustom: boolean;
  createdAt?: Date;
}

const DB_NAME = 'angular-surveys-db';
const DB_VERSION = 1;
const SURVEYS_STORE = 'surveys';
const RESPONSES_STORE = 'responses';
const TEMPLATES_STORE = 'templates';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private db: IDBDatabase | null = null;
  private dbReady$ = new BehaviorSubject<boolean>(false);

  constructor() {
    this.initDatabase();
  }

  private initDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open database:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.dbReady$.next(true);
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Surveys store
        if (!db.objectStoreNames.contains(SURVEYS_STORE)) {
          const surveysStore = db.createObjectStore(SURVEYS_STORE, {
            keyPath: 'id',
          });
          surveysStore.createIndex('status', 'status', { unique: false });
          surveysStore.createIndex('createdAt', 'createdAt', { unique: false });
          surveysStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        // Responses store
        if (!db.objectStoreNames.contains(RESPONSES_STORE)) {
          const responsesStore = db.createObjectStore(RESPONSES_STORE, {
            keyPath: 'id',
          });
          responsesStore.createIndex('surveyId', 'surveyId', { unique: false });
          responsesStore.createIndex('submittedAt', 'submittedAt', {
            unique: false,
          });
        }

        // Templates store
        if (!db.objectStoreNames.contains(TEMPLATES_STORE)) {
          const templatesStore = db.createObjectStore(TEMPLATES_STORE, {
            keyPath: 'id',
          });
          templatesStore.createIndex('category', 'category', { unique: false });
          templatesStore.createIndex('isCustom', 'isCustom', { unique: false });
        }
      };
    });
  }

  private async ensureDb(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    await new Promise<void>((resolve) => {
      const sub = this.dbReady$.subscribe((ready) => {
        if (ready) {
          sub.unsubscribe();
          resolve();
        }
      });
    });
    return this.db!;
  }

  // ==================== SURVEYS ====================

  async getAllSurveys(): Promise<Survey[]> {
    const db = await this.ensureDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(SURVEYS_STORE, 'readonly');
      const store = transaction.objectStore(SURVEYS_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const surveys = request.result.map((s: Survey) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          updatedAt: new Date(s.updatedAt),
          publishedAt: s.publishedAt ? new Date(s.publishedAt) : undefined,
        }));
        // Sort by updatedAt descending
        surveys.sort(
          (a: Survey, b: Survey) =>
            b.updatedAt.getTime() - a.updatedAt.getTime()
        );
        resolve(surveys);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async getSurvey(id: string): Promise<Survey | null> {
    const db = await this.ensureDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(SURVEYS_STORE, 'readonly');
      const store = transaction.objectStore(SURVEYS_STORE);
      const request = store.get(id);

      request.onsuccess = () => {
        if (request.result) {
          resolve({
            ...request.result,
            createdAt: new Date(request.result.createdAt),
            updatedAt: new Date(request.result.updatedAt),
            publishedAt: request.result.publishedAt
              ? new Date(request.result.publishedAt)
              : undefined,
          });
        } else {
          resolve(null);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  async saveSurvey(survey: Survey): Promise<Survey> {
    const db = await this.ensureDb();
    const surveyToSave = {
      ...survey,
      updatedAt: new Date(),
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(SURVEYS_STORE, 'readwrite');
      const store = transaction.objectStore(SURVEYS_STORE);
      const request = store.put(surveyToSave);

      request.onsuccess = () => resolve(surveyToSave);
      request.onerror = () => reject(request.error);
    });
  }

  async createSurvey(form: MWForm): Promise<Survey> {
    const survey: Survey = {
      id: this.generateId(),
      form,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      responseCount: 0,
    };

    return this.saveSurvey(survey);
  }

  async deleteSurvey(id: string): Promise<void> {
    const db = await this.ensureDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        [SURVEYS_STORE, RESPONSES_STORE],
        'readwrite'
      );

      // Delete survey
      const surveyStore = transaction.objectStore(SURVEYS_STORE);
      surveyStore.delete(id);

      // Delete all responses for this survey
      const responsesStore = transaction.objectStore(RESPONSES_STORE);
      const index = responsesStore.index('surveyId');
      const request = index.openCursor(IDBKeyRange.only(id));

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          responsesStore.delete(cursor.primaryKey);
          cursor.continue();
        }
      };

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async duplicateSurvey(id: string): Promise<Survey> {
    const original = await this.getSurvey(id);
    if (!original) throw new Error('Survey not found');

    const newForm = {
      ...original.form,
      name: `${original.form.name} (Copy)`,
    };

    return this.createSurvey(newForm);
  }

  async publishSurvey(id: string): Promise<Survey> {
    const survey = await this.getSurvey(id);
    if (!survey) throw new Error('Survey not found');

    const baseUrl = window.location.origin;
    survey.status = 'published';
    survey.publishedAt = new Date();
    survey.shareUrl = `${baseUrl}/s/${id}`;

    return this.saveSurvey(survey);
  }

  async unpublishSurvey(id: string): Promise<Survey> {
    const survey = await this.getSurvey(id);
    if (!survey) throw new Error('Survey not found');

    survey.status = 'draft';
    survey.shareUrl = undefined;

    return this.saveSurvey(survey);
  }

  // ==================== RESPONSES ====================

  async getResponses(surveyId: string): Promise<SurveyResponse[]> {
    const db = await this.ensureDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(RESPONSES_STORE, 'readonly');
      const store = transaction.objectStore(RESPONSES_STORE);
      const index = store.index('surveyId');
      const request = index.getAll(IDBKeyRange.only(surveyId));

      request.onsuccess = () => {
        const responses = request.result.map((r: SurveyResponse) => ({
          ...r,
          submittedAt: new Date(r.submittedAt),
        }));
        responses.sort(
          (a: SurveyResponse, b: SurveyResponse) =>
            b.submittedAt.getTime() - a.submittedAt.getTime()
        );
        resolve(responses);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async saveResponse(
    surveyId: string,
    responses: Record<string, unknown>
  ): Promise<SurveyResponse> {
    const db = await this.ensureDb();

    const response: SurveyResponse = {
      id: this.generateId(),
      surveyId,
      responses,
      submittedAt: new Date(),
      metadata: {
        userAgent: navigator.userAgent,
      },
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        [RESPONSES_STORE, SURVEYS_STORE],
        'readwrite'
      );

      // Save response
      const responsesStore = transaction.objectStore(RESPONSES_STORE);
      responsesStore.put(response);

      // Update response count
      const surveysStore = transaction.objectStore(SURVEYS_STORE);
      const surveyRequest = surveysStore.get(surveyId);

      surveyRequest.onsuccess = () => {
        const survey = surveyRequest.result;
        if (survey) {
          survey.responseCount = (survey.responseCount || 0) + 1;
          surveysStore.put(survey);
        }
      };

      transaction.oncomplete = () => resolve(response);
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async deleteResponse(id: string): Promise<void> {
    const db = await this.ensureDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(RESPONSES_STORE, 'readwrite');
      const store = transaction.objectStore(RESPONSES_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // ==================== TEMPLATES ====================

  async getAllTemplates(): Promise<SurveyTemplate[]> {
    const db = await this.ensureDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(TEMPLATES_STORE, 'readonly');
      const store = transaction.objectStore(TEMPLATES_STORE);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getTemplate(id: string): Promise<SurveyTemplate | null> {
    const db = await this.ensureDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(TEMPLATES_STORE, 'readonly');
      const store = transaction.objectStore(TEMPLATES_STORE);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async saveTemplate(template: SurveyTemplate): Promise<SurveyTemplate> {
    const db = await this.ensureDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(TEMPLATES_STORE, 'readwrite');
      const store = transaction.objectStore(TEMPLATES_STORE);
      const request = store.put(template);

      request.onsuccess = () => resolve(template);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteTemplate(id: string): Promise<void> {
    const db = await this.ensureDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(TEMPLATES_STORE, 'readwrite');
      const store = transaction.objectStore(TEMPLATES_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async saveAsTemplate(
    survey: Survey,
    name: string,
    description: string,
    category: string
  ): Promise<SurveyTemplate> {
    const template: SurveyTemplate = {
      id: this.generateId(),
      name,
      description,
      category,
      icon: 'description',
      color: '#1A73E8',
      form: survey.form,
      isCustom: true,
      createdAt: new Date(),
    };

    return this.saveTemplate(template);
  }

  // ==================== UTILITIES ====================

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async clearAllData(): Promise<void> {
    const db = await this.ensureDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        [SURVEYS_STORE, RESPONSES_STORE, TEMPLATES_STORE],
        'readwrite'
      );

      transaction.objectStore(SURVEYS_STORE).clear();
      transaction.objectStore(RESPONSES_STORE).clear();
      transaction.objectStore(TEMPLATES_STORE).clear();

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Export/Import functionality
  async exportAllData(): Promise<string> {
    const surveys = await this.getAllSurveys();
    const templates = await this.getAllTemplates();

    const allResponses: SurveyResponse[] = [];
    for (const survey of surveys) {
      const responses = await this.getResponses(survey.id);
      allResponses.push(...responses);
    }

    return JSON.stringify(
      {
        version: 1,
        exportedAt: new Date().toISOString(),
        surveys,
        responses: allResponses,
        templates,
      },
      null,
      2
    );
  }

  async importData(
    jsonData: string
  ): Promise<{ surveys: number; templates: number; responses: number }> {
    const data = JSON.parse(jsonData);
    let surveysCount = 0;
    let templatesCount = 0;
    let responsesCount = 0;

    const isValidForm = (form: unknown): boolean => {
      const f = form as Record<string, unknown> | null;
      if (!f) return false;
      if (typeof f.name !== 'string') return false;
      const pages = f.pages as unknown;
      if (!Array.isArray(pages)) return false;
      for (const p of pages as unknown[]) {
        const pg = p as Record<string, unknown> | null;
        if (!pg) return false;
        if (typeof pg.id !== 'string') return false;
        if (typeof pg.number !== 'number') return false;
        const elements = pg.elements as unknown;
        if (!Array.isArray(elements)) return false;
        for (const e of elements as unknown[]) {
          const el = e as Record<string, unknown> | null;
          if (!el || el.type !== 'question') return false;
          const q = el.question as Record<string, unknown> | null;
          if (!q || typeof q.id !== 'string') return false;
        }
      }
      return true;
    };

    if (Array.isArray(data.surveys)) {
      for (const raw of data.surveys) {
        if (!raw || typeof raw.id !== 'string' || !isValidForm(raw.form)) continue;
        const survey: Survey = {
          id: raw.id,
          form: raw.form,
          status: raw.status === 'published' ? 'published' : 'draft',
          createdAt: new Date(raw.createdAt || Date.now()),
          updatedAt: new Date(raw.updatedAt || Date.now()),
          publishedAt: raw.publishedAt ? new Date(raw.publishedAt) : undefined,
          shareUrl: raw.shareUrl,
          responseCount: Number(raw.responseCount || 0),
        };
        await this.saveSurvey(survey);
        surveysCount++;
      }
    }

    if (Array.isArray(data.templates)) {
      for (const raw of data.templates) {
        if (!raw || typeof raw.id !== 'string' || !isValidForm(raw.form)) continue;
        const template: SurveyTemplate = {
          id: raw.id,
          name: String(raw.name || ''),
          description: String(raw.description || ''),
          category: String(raw.category || 'General'),
          icon: String(raw.icon || 'description'),
          color: String(raw.color || '#1A73E8'),
          form: raw.form,
          isCustom: !!raw.isCustom,
          createdAt: raw.createdAt ? new Date(raw.createdAt) : undefined,
        };
        await this.saveTemplate(template);
        templatesCount++;
      }
    }

    if (Array.isArray(data.responses)) {
      const db = await this.ensureDb();
      const transaction = db.transaction(RESPONSES_STORE, 'readwrite');
      const store = transaction.objectStore(RESPONSES_STORE);
      for (const raw of data.responses) {
        if (!raw || typeof raw.id !== 'string' || typeof raw.surveyId !== 'string') continue;
        const response: SurveyResponse = {
          id: raw.id,
          surveyId: raw.surveyId,
          responses: raw.responses && typeof raw.responses === 'object' ? raw.responses : {},
          submittedAt: new Date(raw.submittedAt || Date.now()),
          metadata: raw.metadata && typeof raw.metadata === 'object' ? raw.metadata : {},
        };
        store.put(response);
        responsesCount++;
      }
    }

    return { surveys: surveysCount, templates: templatesCount, responses: responsesCount };
  }
}
