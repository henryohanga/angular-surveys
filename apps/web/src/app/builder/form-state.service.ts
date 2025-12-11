import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MWForm, MWPage, MWElement, MWQuestion } from '../surveys/models';
import { DEMO_FORM } from '../surveys/demo-data';
import Ajv from 'ajv';

@Injectable({ providedIn: 'root' })
export class FormStateService {
  private readonly storageKey = 'angular-surveys-form';
  private state: MWForm;
  private readonly formSubject: BehaviorSubject<MWForm>;

  /** Observable that emits the current form state whenever it changes */
  readonly form$: Observable<MWForm>;

  constructor() {
    const stored = this.loadFromLocalStorage();
    this.state = stored ?? JSON.parse(JSON.stringify(DEMO_FORM));
    this.formSubject = new BehaviorSubject<MWForm>(this.state);
    this.form$ = this.formSubject.asObservable();
  }

  getForm(): MWForm {
    return this.state;
  }

  /** Notify subscribers of state changes */
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

  importJson(json: string) {
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

  reorderQuestion(pageIndex: number, from: number, to: number): void {
    const page = this.state.pages[pageIndex];
    const elements = [...page.elements];
    const [moved] = elements.splice(from, 1);
    elements.splice(to, 0, moved);
    page.elements = elements.map((e, i) => ({ ...e, orderNo: i + 1 }));
    this.saveToLocalStorage();
    this.notifyChange();
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

  private saveToLocalStorage() {
    try {
      localStorage.setItem(this.storageKey, this.exportJson());
    } catch {
      /* noop */
    }
  }

  private loadFromLocalStorage(): MWForm | null {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? (JSON.parse(raw) as MWForm) : null;
    } catch {
      return null;
    }
  }

  validateForm(form: MWForm): string[] {
    const ajv = new Ajv({ allErrors: true });
    const schema: import('ajv').AnySchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string', nullable: true },
        pages: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              number: { type: 'number' },
              name: { type: 'string', nullable: true },
              description: { type: 'string', nullable: true },
              namedPage: { type: 'boolean' },
              pageFlow: {
                type: 'object',
                properties: {
                  nextPage: { type: 'boolean' },
                  label: { type: 'string' },
                  goToPage: { type: 'number' },
                },
                required: [],
              },
              elements: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    orderNo: { type: 'number' },
                    type: { type: 'string' },
                    question: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        text: { type: 'string' },
                        type: {
                          type: 'string',
                          enum: [
                            'text',
                            'textarea',
                            'radio',
                            'checkbox',
                            'grid',
                            'priority',
                            'select',
                            'date',
                            'time',
                            'scale',
                            'email',
                            'phone',
                            'number',
                            'url',
                          ],
                        },
                        required: { type: 'boolean' },
                        pageFlowModifier: { type: 'boolean' },
                        otherAnswer: { type: 'boolean' },
                        offeredAnswers: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: { type: 'string' },
                              orderNo: { type: 'number' },
                              value: { type: 'string' },
                              pageFlow: {
                                type: 'object',
                                properties: {
                                  nextPage: { type: 'boolean' },
                                  label: { type: 'string' },
                                  goToPage: { type: 'number' },
                                },
                                required: [],
                              },
                            },
                            required: ['id', 'orderNo', 'value'],
                          },
                        },
                        numberConfig: {
                          type: 'object',
                          properties: {
                            min: { type: 'number' },
                            max: { type: 'number' },
                            step: { type: 'number' },
                            prefix: { type: 'string' },
                            suffix: { type: 'string' },
                          },
                          required: [],
                          nullable: true,
                        },
                        fileConfig: {
                          type: 'object',
                          properties: {
                            accept: {
                              type: 'array',
                              items: { type: 'string' },
                            },
                            maxSize: { type: 'number' },
                            multiple: { type: 'boolean' },
                          },
                          required: ['accept'],
                          nullable: true,
                        },
                        placeholder: { type: 'string' },
                        grid: {
                          type: 'object',
                          properties: {
                            cellInputType: {
                              type: 'string',
                              enum: ['radio', 'checkbox'],
                            },
                            rows: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  id: { type: 'string' },
                                  orderNo: { type: 'number' },
                                  label: { type: 'string' },
                                },
                                required: ['id', 'orderNo', 'label'],
                              },
                            },
                            cols: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  id: { type: 'string' },
                                  orderNo: { type: 'number' },
                                  label: { type: 'string' },
                                },
                                required: ['id', 'orderNo', 'label'],
                              },
                            },
                          },
                          required: ['cellInputType', 'rows', 'cols'],
                        },
                        priorityList: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: { type: 'string' },
                              orderNo: { type: 'number' },
                              value: { type: 'string' },
                            },
                            required: ['id', 'orderNo', 'value'],
                          },
                        },
                        scale: {
                          type: 'object',
                          properties: {
                            min: { type: 'number' },
                            max: { type: 'number' },
                            step: { type: 'number' },
                            minLabel: { type: 'string' },
                            maxLabel: { type: 'string' },
                          },
                          required: ['min', 'max'],
                        },
                      },
                      required: ['id', 'text', 'type'],
                    },
                  },
                  required: ['id', 'orderNo', 'type', 'question'],
                },
              },
            },
            required: ['id', 'number', 'elements'],
          },
        },
      },
      required: ['name', 'pages'],
    } as const;

    const validate = ajv.compile(schema);
    const ok = validate(form);
    if (ok) return [];
    return (validate.errors ?? []).map(
      (e) => `${e.instancePath || '/'}: ${e.message}`
    );
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
}
