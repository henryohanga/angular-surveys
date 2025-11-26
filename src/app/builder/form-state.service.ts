import { Injectable } from '@angular/core';
import { MWForm, MWPage, MWElement, MWQuestion } from '../surveys/models';
import { DEMO_FORM } from '../surveys/demo-data';
import Ajv from 'ajv';

@Injectable({ providedIn: 'root' })
export class FormStateService {
  private storageKey = 'angular-surveys-form';
  private state: MWForm;

  constructor() {
    const stored = this.loadFromLocalStorage();
    this.state = stored ?? JSON.parse(JSON.stringify(DEMO_FORM));
  }

  getForm(): MWForm { return this.state; }

  addQuestion(pageIndex: number, q: MWQuestion) {
    const page = this.state.pages[pageIndex];
    q.id = this.ensureUniqueQuestionId(q.id);
    const el: MWElement = { id: q.id, orderNo: page.elements.length + 1, type: 'question', question: q };
    page.elements.push(el);
    this.saveToLocalStorage();
  }

  addPage() {
    const number = this.state.pages.length + 1;
    const page: MWPage = { id: 'page-' + number, number, name: null, description: null, elements: [], pageFlow: { nextPage: true }, namedPage: false };
    this.state.pages.push(page);
    this.saveToLocalStorage();
  }

  setForm(form: MWForm) {
    this.state = form;
    this.saveToLocalStorage();
  }

  importJson(json: string) {
    const parsed = JSON.parse(json) as MWForm;
    this.setForm(parsed);
  }

  exportJson(): string {
    return JSON.stringify(this.state, null, 2);
  }

  updateQuestion(pageIndex: number, index: number, q: MWQuestion) {
    const page = this.state.pages[pageIndex];
    q.id = this.ensureUniqueQuestionId(q.id, { pageIndex, index });
    page.elements[index] = { ...page.elements[index], id: q.id, question: q };
    this.saveToLocalStorage();
  }

  deleteQuestion(pageIndex: number, index: number) {
    const page = this.state.pages[pageIndex];
    page.elements.splice(index, 1);
    page.elements.forEach((e, i) => e.orderNo = i + 1);
    this.saveToLocalStorage();
  }

  reorderQuestion(pageIndex: number, from: number, to: number) {
    const page = this.state.pages[pageIndex];
    const [moved] = page.elements.splice(from, 1);
    page.elements.splice(to, 0, moved);
    page.elements.forEach((e, i) => e.orderNo = i + 1);
    this.saveToLocalStorage();
  }

  private ensureUniqueQuestionId(desired: string, exclude?: { pageIndex: number; index: number }): string {
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
    try { localStorage.setItem(this.storageKey, this.exportJson()); } catch { /* noop */ }
  }

  private loadFromLocalStorage(): MWForm | null {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) as MWForm : null;
    } catch { return null; }
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
                  goToPage: { type: 'number' }
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
                        type: { type: 'string', enum: ['text','textarea','radio','checkbox','grid','priority','select','date','time','scale'] },
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
                                  goToPage: { type: 'number' }
                                },
                                required: [],
                              }
                            },
                            required: ['id','orderNo','value']
                          },
                          
                        },
                        grid: {
                          type: 'object',
                          properties: {
                            cellInputType: { type: 'string', enum: ['radio','checkbox'] },
                            rows: {
                              type: 'array',
                              items: { type: 'object', properties: { id: { type: 'string' }, orderNo: { type: 'number' }, label: { type: 'string' } }, required: ['id','orderNo','label'] }
                            },
                            cols: {
                              type: 'array',
                              items: { type: 'object', properties: { id: { type: 'string' }, orderNo: { type: 'number' }, label: { type: 'string' } }, required: ['id','orderNo','label'] }
                            }
                          },
                          required: ['cellInputType','rows','cols'],
                          
                        },
                        priorityList: {
                          type: 'array',
                          items: { type: 'object', properties: { id: { type: 'string' }, orderNo: { type: 'number' }, value: { type: 'string' } }, required: ['id','orderNo','value'] },
                          
                        },
                        scale: {
                          type: 'object',
                          properties: {
                            min: { type: 'number' },
                            max: { type: 'number' },
                            step: { type: 'number' }
                          },
                          required: ['min','max'],
                          
                        }
                      },
                      required: ['id','text','type']
                    }
                  },
                  required: ['id','orderNo','type','question']
                }
              }
            },
            required: ['id','number','elements']
          }
        }
      },
      required: ['name','pages']
    } as const;

    const validate = ajv.compile(schema);
    const ok = validate(form);
    if (ok) return [];
    return (validate.errors ?? []).map(e => `${e.instancePath || '/'}: ${e.message}`);
  }
  updatePageMeta(pageIndex: number, partial: Partial<MWPage>) {
    const p = this.state.pages[pageIndex];
    this.state.pages[pageIndex] = { ...p, ...partial };
    this.saveToLocalStorage();
  }

  updatePageFlow(pageIndex: number, flow: Partial<MWPage['pageFlow']>) {
    const p = this.state.pages[pageIndex];
    const next = { ...p.pageFlow, ...flow };
    this.state.pages[pageIndex] = { ...p, pageFlow: next };
    this.saveToLocalStorage();
  }
}
