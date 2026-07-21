import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MWForm, MWPage, MWElement, MWQuestion } from '@angular-surveys/survey-renderer';
import Ajv from 'ajv';

const DEFAULT_FORM: MWForm = {
  name: 'Untitled Survey',
  description: '',
  pages: [
    {
      id: 'page-1',
      number: 1,
      name: null,
      description: null,
      elements: [],
      pageFlow: { nextPage: true },
      namedPage: false,
    },
  ],
};

@Injectable()
export class FormStateService {
  private readonly storageKey = 'survey-builder-form';
  private state: MWForm;
  private readonly formSubject: BehaviorSubject<MWForm>;

  readonly form$: Observable<MWForm>;

  constructor() {
    const stored = this.loadFromLocalStorage();
    this.state = stored ?? JSON.parse(JSON.stringify(DEFAULT_FORM)) as MWForm;
    this.formSubject = new BehaviorSubject<MWForm>(this.state);
    this.form$ = this.formSubject.asObservable();
  }

  getForm(): MWForm {
    return this.state;
  }

  private notifyChange(): void {
    this.formSubject.next(this.state);
  }

  addQuestion(pageIndex: number, q: MWQuestion): void {
    const page = this.state.pages[pageIndex];
    q.id = this.ensureUniqueQuestionId(q.id);
    const el: MWElement = {
      id: q.id,
      orderNo: page.elements.length + 1,
      type: 'question',
      question: q,
    };
    page.elements = [...page.elements, el];
    this.saveToLocalStorage();
    this.notifyChange();
  }

  addPage(): void {
    const number = this.state.pages.length + 1;
    const page: MWPage = {
      id: 'page-' + number,
      number,
      name: null,
      description: null,
      elements: [],
      pageFlow: { nextPage: true },
      namedPage: false,
    };
    this.state.pages = [...this.state.pages, page];
    this.saveToLocalStorage();
    this.notifyChange();
  }

  setForm(form: MWForm): void {
    this.state = form;
    this.saveToLocalStorage();
    this.notifyChange();
  }

  importJson(json: string): void {
    const parsed = JSON.parse(json) as MWForm;
    this.setForm(parsed);
  }

  exportJson(): string {
    return JSON.stringify(this.state, null, 2);
  }

  updateQuestion(pageIndex: number, index: number, q: MWQuestion): void {
    const page = this.state.pages[pageIndex];
    q.id = this.ensureUniqueQuestionId(q.id, { pageIndex, index });
    page.elements = page.elements.map((el, i) =>
      i === index ? { ...el, id: q.id, question: q } : el
    );
    this.saveToLocalStorage();
    this.notifyChange();
  }

  deleteQuestion(pageIndex: number, index: number): void {
    const page = this.state.pages[pageIndex];
    page.elements = page.elements
      .filter((_, i) => i !== index)
      .map((e, i) => ({ ...e, orderNo: i + 1 }));
    this.saveToLocalStorage();
    this.notifyChange();
  }

  /** Restores a previously-deleted element at a specific index — used to back a real Undo action. */
  insertQuestion(pageIndex: number, index: number, el: MWElement): void {
    const page = this.state.pages[pageIndex];
    if (!page) return;
    const elements = [...page.elements];
    elements.splice(index, 0, el);
    page.elements = elements.map((e, i) => ({ ...e, orderNo: i + 1 }));
    this.saveToLocalStorage();
    this.notifyChange();
  }

  reorderQuestion(pageIndex: number, from: number, to: number): void {
    const page = this.state.pages[pageIndex];
    const elements = [...page.elements];
    const [moved] = elements.splice(from, 1);
    elements.splice(to, 0, moved);
    page.elements = elements.map((e, i) => ({ ...e, orderNo: i + 1 }));
    this.saveToLocalStorage();
    this.notifyChange();
  }

  updatePageMeta(pageIndex: number, partial: Partial<MWPage>): void {
    this.state.pages = this.state.pages.map((p, i) =>
      i === pageIndex ? { ...p, ...partial } : p
    );
    this.saveToLocalStorage();
    this.notifyChange();
  }

  updatePageFlow(pageIndex: number, flow: Partial<MWPage['pageFlow']>): void {
    this.state.pages = this.state.pages.map((p, i) =>
      i === pageIndex ? { ...p, pageFlow: { ...p.pageFlow, ...flow } } : p
    );
    this.saveToLocalStorage();
    this.notifyChange();
  }

  deletePage(pageIndex: number): void {
    if (this.state.pages.length <= 1) return;
    this.state.pages = this.state.pages
      .filter((_, i) => i !== pageIndex)
      .map((p, i) => ({ ...p, number: i + 1 }));
    this.saveToLocalStorage();
    this.notifyChange();
  }

  /** Restores a previously-deleted page at a specific index — used to back a real Undo action. */
  insertPage(index: number, page: MWPage): void {
    const pages = [...this.state.pages];
    pages.splice(index, 0, page);
    this.state.pages = pages.map((p, i) => ({ ...p, number: i + 1 }));
    this.saveToLocalStorage();
    this.notifyChange();
  }

  validateForm(form: MWForm): string[] {
    const ajv = new Ajv({ allErrors: true });
    const schema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        pages: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              number: { type: 'number' },
              elements: { type: 'array' },
            },
            required: ['id', 'number', 'elements'],
          },
        },
      },
      required: ['name', 'pages'],
    };
    const validate = ajv.compile(schema);
    const ok = validate(form);
    if (ok) return [];
    return (validate.errors ?? []).map((e) => `${e.instancePath || '/'}: ${e.message}`);
  }

  private ensureUniqueQuestionId(
    desired: string,
    exclude?: { pageIndex: number; index: number }
  ): string {
    const used = new Set<string>();
    this.state.pages.forEach((p, pi) => {
      p.elements.forEach((e, ei) => {
        if (exclude && exclude.pageIndex === pi && exclude.index === ei) return;
        used.add(e.question.id);
      });
    });
    if (!desired || used.has(desired)) {
      let base = desired?.trim() || 'question';
      base = base.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      let i = 1;
      let candidate = base;
      while (used.has(candidate) || candidate.length === 0) {
        candidate = `${base}-${i++}`;
      }
      return candidate;
    }
    return desired;
  }

  private saveToLocalStorage(): void {
    try {
      localStorage.setItem(this.storageKey, this.exportJson());
    } catch { /* noop */ }
  }

  private loadFromLocalStorage(): MWForm | null {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? (JSON.parse(raw) as MWForm) : null;
    } catch {
      return null;
    }
  }
}
