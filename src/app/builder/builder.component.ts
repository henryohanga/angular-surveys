import { Component } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { } from '@angular/forms';
import { FormStateService } from './form-state.service';
import { MWElement, MWForm, MWQuestion } from '../surveys/models';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-builder',
  templateUrl: './builder.component.html',
  styleUrls: ['./builder.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(8px)' }),
        animate('180ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class BuilderComponent {
  formDef: MWForm;
  selectedPage = 0;
  editorOpen = false;
  importText = '';
  importError: string | null = null;
  editingIndex: number | null = null;
  editingInitial: MWQuestion | null = null;

  constructor(private state: FormStateService) {
    this.formDef = this.state.getForm();
  }

  addPage() {
    this.state.addPage();
    this.selectedPage = this.formDef.pages.length - 1;
  }

  openEditor() { this.editorOpen = true; }
  closeEditor() { this.editorOpen = false; }

  addQuestion(q: MWQuestion) {
    if (this.editingIndex !== null) {
      this.state.updateQuestion(this.selectedPage, this.editingIndex, q);
      this.editingIndex = null;
      this.editingInitial = null;
    } else {
      this.state.addQuestion(this.selectedPage, q);
    }
    this.closeEditor();
  }

  editQuestion(i: number) {
    const el = this.formDef.pages[this.selectedPage].elements[i];
    this.editingIndex = i;
    this.editingInitial = el.question;
    this.openEditor();
  }

  deleteQuestion(i: number) {
    this.state.deleteQuestion(this.selectedPage, i);
  }

  drop(e: CdkDragDrop<MWElement[]>) {
    this.state.reorderQuestion(this.selectedPage, e.previousIndex, e.currentIndex);
  }

  exportJson() {
    this.importText = this.state.exportJson();
    this.importError = null;
  }

  importJson() {
    if (this.importText?.trim()) {
      try {
        const parsed = JSON.parse(this.importText) as MWForm;
        const errs = this.state.validateForm(parsed);
        if (errs.length) {
          this.importError = errs.join('\n');
          return;
        }
        this.state.importJson(this.importText);
        this.formDef = this.state.getForm();
        this.selectedPage = 0;
        this.importError = null;
      } catch {
        this.importError = 'Invalid JSON';
      }
    }
  }

  updatePageName(name: string) {
    this.state.updatePageMeta(this.selectedPage, { name });
  }

  updatePageDescription(description: string) {
    this.state.updatePageMeta(this.selectedPage, { description });
  }

  updateNamedPage(namedPage: boolean) {
    this.state.updatePageMeta(this.selectedPage, { namedPage });
  }

  setPageGoTo(goToPage: number | null) {
    this.state.updatePageFlow(this.selectedPage, { goToPage, nextPage: !goToPage ? this.formDef.pages[this.selectedPage].pageFlow?.nextPage : false });
  }

  setPageNext(nextPage: boolean) {
    this.state.updatePageFlow(this.selectedPage, { nextPage, goToPage: nextPage ? null : this.formDef.pages[this.selectedPage].pageFlow?.goToPage });
  }

  pageNumbers(): number[] {
    return this.formDef.pages.map(p => p.number);
  }
 
  exportToFile() {
    const data = this.state.exportJson();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'survey.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  importFromFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      this.importText = text;
      this.importJson();
    };
    reader.readAsText(file);
  }
}
