import { Injectable } from '@angular/core';
import { MWForm, MWPage, MWElement, MWQuestion } from '../surveys/models';
import { DEMO_FORM } from '../surveys/demo-data';

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
    page.elements[index] = { ...page.elements[index], question: q };
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

  private saveToLocalStorage() {
    try { localStorage.setItem(this.storageKey, this.exportJson()); } catch { /* noop */ }
  }

  private loadFromLocalStorage(): MWForm | null {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) as MWForm : null;
    } catch { return null; }
  }
}
