import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { FormStateService } from './form-state.service';
import { MWElement, MWForm, MWQuestion, MWTextType } from '../surveys/models';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SurveyPreviewDialogComponent } from './survey-preview-dialog.component';
import {
  QuestionDialogComponent,
  QuestionDialogData,
} from './question-dialog.component';
import { StorageService, Survey } from '../core/services/storage.service';

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
export class BuilderComponent implements OnInit {
  formDef!: MWForm;
  survey: Survey | null = null;
  surveyId: string | null = null;
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
  isLoading = true;

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
    {
      type: 'priority',
      label: 'Ranking',
      icon: 'format_list_numbered',
      description: 'Drag to rank items',
    },
  ];

  constructor(
    private state: FormStateService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private storage: StorageService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit() {
    this.surveyId = this.route.snapshot.paramMap.get('id');

    if (this.surveyId) {
      // Load existing survey
      try {
        this.survey = await this.storage.getSurvey(this.surveyId);
        if (this.survey) {
          this.formDef = this.survey.form;
          this.surveyStatus = this.survey.status;
          this.lastSaved = this.survey.updatedAt;
          this.state.importJson(JSON.stringify(this.formDef));
        } else {
          this.snackBar.open('Survey not found', 'Close', { duration: 3000 });
          this.router.navigate(['/dashboard']);
          return;
        }
      } catch {
        this.snackBar.open('Failed to load survey', 'Close', {
          duration: 3000,
        });
        this.router.navigate(['/dashboard']);
        return;
      }
    } else {
      // Create new survey or use existing state
      this.formDef = this.state.getForm();
    }

    this.isLoading = false;
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
    this.editingIndex = null;
    this.editingInitial = null;
  }

  // Open the new question dialog
  openQuestionDialog(question?: MWQuestion, index?: number) {
    const dialogData: QuestionDialogData = {
      question: question,
      pageNumbers: this.formDef.pages.map((p) => p.number),
      mode: question ? 'edit' : 'create',
    };

    const dialogRef = this.dialog.open(QuestionDialogComponent, {
      width: '640px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: dialogData,
      panelClass: 'question-dialog-container',
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((result: MWQuestion | undefined) => {
      if (result) {
        if (index !== undefined) {
          this.state.updateQuestion(this.selectedPage, index, result);
          this.snackBar.open('Question updated', 'Close', { duration: 2000 });
        } else {
          this.state.addQuestion(this.selectedPage, result);
          this.snackBar.open('Question added', 'Close', { duration: 2000 });
        }
      }
    });
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
    // Use the new dialog instead
    this.openQuestionDialog(el.question, i);
  }

  duplicateQuestion(i: number) {
    const el = this.formDef.pages[this.selectedPage].elements[i];
    const duplicate: MWQuestion = {
      ...JSON.parse(JSON.stringify(el.question)),
      id: 'q-' + Date.now(),
      text: el.question.text + ' (copy)',
    };
    this.state.addQuestion(this.selectedPage, duplicate);
    this.snackBar.open('Question duplicated', 'Close', { duration: 2000 });
  }

  deleteQuestion(i: number) {
    this.state.deleteQuestion(this.selectedPage, i);
    this.snackBar.open('Question deleted', 'Undo', { duration: 3000 });
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

  updateSurveyName(name: string) {
    this.formDef.name = name;
    this.state.importJson(JSON.stringify(this.formDef));
  }

  updateSurveyDescription(description: string) {
    this.formDef.description = description;
    this.state.importJson(JSON.stringify(this.formDef));
  }

  formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
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
  async saveSurvey() {
    this.isSaving = true;
    try {
      // Sync formDef with state
      this.formDef = this.state.getForm();

      if (this.surveyId && this.survey) {
        // Update existing survey
        this.survey.form = this.formDef;
        this.survey = await this.storage.saveSurvey(this.survey);
      } else {
        // Create new survey
        this.survey = await this.storage.createSurvey(this.formDef);
        this.surveyId = this.survey.id;
        // Update URL without navigation
        this.router.navigate(['/builder', this.surveyId], { replaceUrl: true });
      }

      this.lastSaved = new Date();
      this.snackBar.open('Survey saved successfully!', 'Dismiss', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
    } catch {
      this.snackBar.open('Failed to save survey', 'Close', { duration: 3000 });
    } finally {
      this.isSaving = false;
    }
  }

  // Publish functionality
  async publishSurvey() {
    // Save first if needed
    if (!this.surveyId) {
      await this.saveSurvey();
    }

    if (!this.surveyId) return;

    this.isPublishing = true;
    try {
      this.survey = await this.storage.publishSurvey(this.surveyId);
      this.surveyStatus = 'published';

      const snackRef = this.snackBar.open('Survey published!', 'Copy Link', {
        duration: 5000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });

      snackRef.onAction().subscribe(() => {
        if (this.survey?.shareUrl) {
          navigator.clipboard.writeText(this.survey.shareUrl);
          this.snackBar.open('Link copied!', 'Close', { duration: 2000 });
        }
      });
    } catch {
      this.snackBar.open('Failed to publish survey', 'Close', {
        duration: 3000,
      });
    } finally {
      this.isPublishing = false;
    }
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
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

    // Add default priority items for ranking
    if (type === 'priority') {
      newQuestion.priorityList = [
        { id: 'p1', orderNo: 1, value: 'Item 1' },
        { id: 'p2', orderNo: 2, value: 'Item 2' },
        { id: 'p3', orderNo: 3, value: 'Item 3' },
      ];
    }

    // Add default grid structure
    if (type === 'grid') {
      newQuestion.grid = {
        cellInputType: 'radio',
        rows: [
          { id: 'row-1', orderNo: 1, label: 'Row 1' },
          { id: 'row-2', orderNo: 2, label: 'Row 2' },
        ],
        cols: [
          { id: 'col-1', orderNo: 1, label: 'Column 1' },
          { id: 'col-2', orderNo: 2, label: 'Column 2' },
          { id: 'col-3', orderNo: 3, label: 'Column 3' },
        ],
      };
    }

    this.state.addQuestion(this.selectedPage, newQuestion);

    // Open dialog to edit the newly added question
    const elements = this.formDef.pages[this.selectedPage].elements;
    const newIndex = elements.length - 1;
    this.openQuestionDialog(newQuestion, newIndex);
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
