import { Component } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { FormStateService } from './form-state.service';
import { MWElement, MWForm, MWQuestion, MWTextType } from '../surveys/models';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SurveyPreviewDialogComponent } from './survey-preview-dialog.component';

interface ComponentItem {
  type: MWTextType;
  label: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-builder',
  templateUrl: './builder.component.html',
  styleUrls: ['./builder.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(8px)' }),
        animate(
          '180ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-12px)' }),
        animate(
          '200ms ease-out',
          style({ opacity: 1, transform: 'translateX(0)' })
        ),
      ]),
    ]),
  ],
})
export class BuilderComponent {
  formDef: MWForm;
  selectedPage = 0;
  editorOpen = false;
  importText = '';
  importError: string | null = null;
  editingIndex: number | null = null;
  editingInitial: MWQuestion | null = null;
  isSaving = false;
  isPublishing = false;
  surveyStatus: 'draft' | 'published' = 'draft';
  lastSaved: Date | null = null;
  showComponentPanel = true;

  // Available input components for drag-and-drop
  componentItems: ComponentItem[] = [
    {
      type: 'text',
      label: 'Text Field',
      icon: 'text_fields',
      description: 'Single line text input',
    },
    {
      type: 'textarea',
      label: 'Long Text',
      icon: 'notes',
      description: 'Multi-line text area',
    },
    {
      type: 'radio',
      label: 'Multiple Choice',
      icon: 'radio_button_checked',
      description: 'Single selection from options',
    },
    {
      type: 'checkbox',
      label: 'Checkboxes',
      icon: 'check_box',
      description: 'Multiple selection from options',
    },
    {
      type: 'select',
      label: 'Dropdown',
      icon: 'arrow_drop_down_circle',
      description: 'Dropdown selection',
    },
    {
      type: 'scale',
      label: 'Rating',
      icon: 'star',
      description: 'Numeric rating scale',
    },
    {
      type: 'date',
      label: 'Date',
      icon: 'calendar_today',
      description: 'Date picker',
    },
    {
      type: 'time',
      label: 'Time',
      icon: 'schedule',
      description: 'Time picker',
    },
    {
      type: 'grid',
      label: 'Grid',
      icon: 'grid_on',
      description: 'Matrix/grid question',
    },
  ];

  constructor(
    private state: FormStateService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.formDef = this.state.getForm();
  }

  addPage() {
    this.state.addPage();
    this.selectedPage = this.formDef.pages.length - 1;
  }

  openEditor() {
    this.editorOpen = true;
  }
  closeEditor() {
    this.editorOpen = false;
  }

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
    this.state.reorderQuestion(
      this.selectedPage,
      e.previousIndex,
      e.currentIndex
    );
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
    this.state.updatePageFlow(this.selectedPage, {
      goToPage,
      nextPage: !goToPage
        ? this.formDef.pages[this.selectedPage].pageFlow?.nextPage
        : false,
    });
  }

  setPageNext(nextPage: boolean) {
    this.state.updatePageFlow(this.selectedPage, {
      nextPage,
      goToPage: nextPage
        ? null
        : this.formDef.pages[this.selectedPage].pageFlow?.goToPage,
    });
  }

  pageNumbers(): number[] {
    return this.formDef.pages.map((p) => p.number);
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

  // Preview functionality
  openPreview() {
    this.dialog.open(SurveyPreviewDialogComponent, {
      width: '90vw',
      maxWidth: '900px',
      maxHeight: '90vh',
      data: { form: this.formDef },
      panelClass: 'preview-dialog-container',
    });
  }

  // Save functionality
  saveSurvey() {
    this.isSaving = true;
    // Simulate save operation - in real app would call API
    setTimeout(() => {
      // State is auto-saved on each operation via FormStateService
      this.lastSaved = new Date();
      this.isSaving = false;
      this.snackBar.open('Survey saved successfully!', 'Dismiss', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
    }, 800);
  }

  // Publish functionality
  publishSurvey() {
    this.isPublishing = true;
    // Simulate publish operation - in real app would call API
    setTimeout(() => {
      this.surveyStatus = 'published';
      this.isPublishing = false;
      this.snackBar.open('Survey published successfully!', 'View', {
        duration: 5000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
    }, 1200);
  }

  // Add question from component drag
  addQuestionFromComponent(type: MWTextType) {
    const newQuestion: MWQuestion = {
      id: 'q-' + Date.now(),
      text: this.getDefaultQuestionText(type),
      type: type,
      required: false,
    };

    // Add default options for choice types
    if (type === 'radio' || type === 'checkbox' || type === 'select') {
      newQuestion.offeredAnswers = [
        { id: 'opt-1', orderNo: 1, value: 'Option 1' },
        { id: 'opt-2', orderNo: 2, value: 'Option 2' },
        { id: 'opt-3', orderNo: 3, value: 'Option 3' },
      ];
    }

    // Add default scale for rating
    if (type === 'scale') {
      newQuestion.scale = { min: 1, max: 5, step: 1 };
    }

    this.state.addQuestion(this.selectedPage, newQuestion);

    // Open editor for the newly added question
    const elements = this.formDef.pages[this.selectedPage].elements;
    this.editingIndex = elements.length - 1;
    this.editingInitial = newQuestion;
    this.openEditor();
  }

  private getDefaultQuestionText(type: MWTextType): string {
    const labels: Record<MWTextType, string> = {
      text: 'Short answer question',
      textarea: 'Long answer question',
      radio: 'Multiple choice question',
      checkbox: 'Checkbox question',
      select: 'Dropdown question',
      scale: 'Rating question',
      date: 'Date question',
      time: 'Time question',
      grid: 'Grid question',
      priority: 'Priority ranking question',
    };
    return labels[type] || 'New question';
  }

  // Component drag handlers
  dropFromToolbox(event: CdkDragDrop<ComponentItem[] | MWElement[]>) {
    if (event.previousContainer === event.container) {
      // Reordering within the form
      this.state.reorderQuestion(
        this.selectedPage,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      // Adding from toolbox
      const componentItem = this.componentItems[event.previousIndex];
      this.addQuestionFromComponent(componentItem.type);
    }
  }

  getQuestionIcon(type: MWTextType): string {
    const item = this.componentItems.find((c) => c.type === type);
    return item?.icon || 'help_outline';
  }

  toggleComponentPanel() {
    this.showComponentPanel = !this.showComponentPanel;
  }

  deletePage(index: number) {
    if (this.formDef.pages.length > 1) {
      this.formDef.pages.splice(index, 1);
      // Renumber pages
      this.formDef.pages.forEach((p, i) => (p.number = i + 1));
      if (this.selectedPage >= this.formDef.pages.length) {
        this.selectedPage = this.formDef.pages.length - 1;
      }
    }
  }

  getTotalQuestions(): number {
    return this.formDef.pages.reduce(
      (sum, page) => sum + page.elements.length,
      0
    );
  }
}
