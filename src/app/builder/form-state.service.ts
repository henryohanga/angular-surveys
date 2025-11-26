import { Injectable } from '@angular/core';
import { MWForm, MWPage, MWElement, MWQuestion } from '../surveys/models';
import { DEMO_FORM } from '../surveys/demo-data';

@Injectable({ providedIn: 'root' })
export class FormStateService {
  private state: MWForm = JSON.parse(JSON.stringify(DEMO_FORM));

  getForm(): MWForm { return this.state; }

  addQuestion(pageIndex: number, q: MWQuestion) {
    const page = this.state.pages[pageIndex];
    const el: MWElement = { id: q.id, orderNo: page.elements.length + 1, type: 'question', question: q };
    page.elements.push(el);
  }

  addPage() {
    const number = this.state.pages.length + 1;
    const page: MWPage = { id: 'page-' + number, number, name: null, description: null, elements: [], pageFlow: { nextPage: true }, namedPage: false };
    this.state.pages.push(page);
  }

  setForm(form: MWForm) {
    this.state = form;
  }

  importJson(json: string) {
    const parsed = JSON.parse(json) as MWForm;
    this.setForm(parsed);
  }

  exportJson(): string {
    return JSON.stringify(this.state, null, 2);
  }
}
