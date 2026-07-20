import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  inject,
} from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { FormStateService } from '../form-state.service';
import { MWElement, MWForm, MWQuestion, MWTextType } from '@angular-surveys/survey-renderer';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SurveyPreviewDialogComponent } from '../preview/survey-preview-dialog.component';
import { QuestionDialogComponent, QuestionDialogData } from '../question-dialog/question-dialog.component';
import { SURVEY_BUILDER_API, ISurveyBuilderApi, SurveyBuilderRecord } from '../tokens';
import { firstValueFrom, Subject, takeUntil, debounceTime, skip } from 'rxjs';

export interface BuilderNavigateEvent {
  to: 'dashboard' | 'responses' | 'preview';
  surveyId?: string;
}

interface ComponentItem {
  type: MWTextType;
  label: string;
  icon: string;
  description: string;
}

@Component({
  standalone: false,
  selector: 'as-survey-builder',
  templateUrl: './survey-builder.component.html',
  styleUrls: ['./survey-builder.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(8px)' }),
        animate('180ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-12px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
    ]),
  ],
})
export class SurveyBuilderComponent implements OnInit, OnDestroy {
  @Input() surveyId?: string;
  @Output() readonly navigate = new EventEmitter<BuilderNavigateEvent>();
  @Output() readonly saved = new EventEmitter<{ surveyId: string }>();
  @Output() readonly published = new EventEmitter<{ surveyId: string; shareUrl: string }>();

  private readonly state = inject(FormStateService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  @Optional() private readonly api = inject<ISurveyBuilderApi>(SURVEY_BUILDER_API, { optional: true } as never);

  protected formDef!: MWForm;
  protected survey: SurveyBuilderRecord | null = null;
  protected selectedPage = 0;
  protected isSaving = false;
  protected isPublishing = false;
  protected surveyStatus: 'draft' | 'published' = 'draft';
  protected lastSaved: Date | null = null;
  protected showComponentPanel = true;
  protected isLoading = true;
  protected hasUnsavedChanges = false;
  protected importText = '';
  protected importError: string | null = null;
  private readonly autoSaveDebounceMs = 3000;

  protected readonly componentItems: ComponentItem[] = [
    { type: 'text', label: 'Short Text', icon: 'short_text', description: 'Single line answer' },
    { type: 'textarea', label: 'Long Text', icon: 'notes', description: 'Paragraph answer' },
    { type: 'email', label: 'Email', icon: 'email', description: 'Email address' },
    { type: 'phone', label: 'Phone', icon: 'phone', description: 'Phone number' },
    { type: 'number', label: 'Number', icon: 'pin', description: 'Numeric input' },
    { type: 'url', label: 'Website', icon: 'link', description: 'URL input' },
    { type: 'date', label: 'Date', icon: 'calendar_today', description: 'Date picker' },
    { type: 'time', label: 'Time', icon: 'schedule', description: 'Time picker' },
    { type: 'radio', label: 'Single Choice', icon: 'radio_button_checked', description: 'Select one' },
    { type: 'checkbox', label: 'Multiple Choice', icon: 'check_box', description: 'Select multiple' },
    { type: 'select', label: 'Dropdown', icon: 'arrow_drop_down_circle', description: 'Dropdown list' },
    { type: 'scale', label: 'Linear Scale', icon: 'linear_scale', description: 'Scale rating' },
    { type: 'rating', label: 'Star Rating', icon: 'star', description: '5-star rating' },
    { type: 'nps', label: 'NPS Score', icon: 'speed', description: '0-10 score' },
    { type: 'grid', label: 'Matrix Grid', icon: 'grid_on', description: 'Grid questions' },
    { type: 'priority', label: 'Ranking', icon: 'format_list_numbered', description: 'Rank items' },
    { type: 'file', label: 'File Upload', icon: 'cloud_upload', description: 'Upload files' },
    { type: 'signature', label: 'Signature', icon: 'gesture', description: 'Draw signature' },
  ];

  async ngOnInit(): Promise<void> {
    this.state.form$.pipe(takeUntil(this.destroy$)).subscribe((form) => {
      this.formDef = form;
      this.cdr.markForCheck();
    });

    this.state.form$
      .pipe(takeUntil(this.destroy$), skip(1), debounceTime(this.autoSaveDebounceMs))
      .subscribe(() => {
        if (this.surveyId && !this.isSaving) this.autoSave();
        else if (!this.surveyId) { this.hasUnsavedChanges = true; this.cdr.markForCheck(); }
      });

    this.state.form$.pipe(takeUntil(this.destroy$), skip(1)).subscribe(() => {
      this.hasUnsavedChanges = true;
      this.cdr.markForCheck();
    });

    if (this.surveyId && this.api) {
      try {
        const apiSurvey = await firstValueFrom(this.api.getSurvey(this.surveyId));
        this.survey = apiSurvey;
        this.state.importJson(JSON.stringify(apiSurvey.form));
        this.formDef = this.state.getForm();
        this.surveyStatus = apiSurvey.status;
        if (apiSurvey.updatedAt) this.lastSaved = new Date(apiSurvey.updatedAt);
      } catch {
        this.snackBar.open('Failed to load survey', 'Close', { duration: 3000 });
        this.navigate.emit({ to: 'dashboard' });
        return;
      }
    } else {
      this.formDef = this.state.getForm();
    }
    this.isLoading = false;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected addPage(): void {
    this.state.addPage();
    this.selectedPage = this.formDef.pages.length - 1;
  }

  protected openQuestionDialog(question?: MWQuestion, index?: number): void {
    const dialogData: QuestionDialogData = {
      question,
      pageNumbers: this.formDef.pages.map((p) => p.number),
      mode: question ? 'edit' : 'create',
    };

    const ref = this.dialog.open(QuestionDialogComponent, {
      width: '680px', maxWidth: '95vw', maxHeight: '85vh',
      data: dialogData, panelClass: 'question-dialog-container', autoFocus: false,
    });

    ref.afterClosed().subscribe((result: MWQuestion | undefined) => {
      if (result) {
        if (index !== undefined) {
          this.state.updateQuestion(this.selectedPage, index, result);
          this.snackBar.open('Question updated', 'Close', { duration: 2000 });
        } else {
          this.state.addQuestion(this.selectedPage, result);
          this.snackBar.open('Question added', 'Close', { duration: 2000 });
        }
        this.cdr.detectChanges();
      }
    });
  }

  protected editQuestion(i: number): void {
    const el = this.formDef.pages[this.selectedPage].elements[i];
    this.openQuestionDialog(el.question, i);
  }

  protected duplicateQuestion(i: number): void {
    const el = this.formDef.pages[this.selectedPage].elements[i];
    const duplicate: MWQuestion = {
      ...JSON.parse(JSON.stringify(el.question)) as MWQuestion,
      id: 'q-' + Date.now(),
      text: el.question.text + ' (copy)',
    };
    this.state.addQuestion(this.selectedPage, duplicate);
    this.snackBar.open('Question duplicated', 'Close', { duration: 2000 });
    this.cdr.detectChanges();
  }

  protected deleteQuestion(i: number): void {
    this.state.deleteQuestion(this.selectedPage, i);
    this.snackBar.open('Question deleted', 'Undo', { duration: 3000 });
    this.cdr.detectChanges();
  }

  protected drop(e: CdkDragDrop<MWElement[]>): void {
    this.state.reorderQuestion(this.selectedPage, e.previousIndex, e.currentIndex);
    this.cdr.detectChanges();
  }

  protected updatePageName(name: string): void { this.state.updatePageMeta(this.selectedPage, { name }); }
  protected updatePageDescription(description: string): void { this.state.updatePageMeta(this.selectedPage, { description }); }

  protected updateSurveyName(name: string): void {
    this.formDef.name = name;
    this.state.importJson(JSON.stringify(this.formDef));
  }

  protected updateSurveyDescription(description: string): void {
    this.formDef.description = description;
    this.state.importJson(JSON.stringify(this.formDef));
  }

  protected updateAnsweringFlow(flow: 'continuous' | 'question-by-question'): void {
    if (!this.formDef.settings) this.formDef.settings = {};
    this.formDef.settings.answeringFlow = flow;
    this.state.importJson(JSON.stringify(this.formDef));
  }

  protected getAnsweringFlow(): 'continuous' | 'question-by-question' {
    return this.formDef.settings?.answeringFlow ?? 'continuous';
  }

  protected formatTimeAgo(date: Date): string {
    const diffMs = Date.now() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  }

  protected exportJson(): void { this.importText = this.state.exportJson(); this.importError = null; }

  protected importJson(): void {
    if (this.importText?.trim()) {
      try {
        const parsed = JSON.parse(this.importText) as MWForm;
        const errs = this.state.validateForm(parsed);
        if (errs.length) { this.importError = errs.join('\n'); return; }
        this.state.importJson(this.importText);
        this.formDef = this.state.getForm();
        this.selectedPage = 0;
        this.importError = null;
      } catch { this.importError = 'Invalid JSON'; }
    }
  }

  protected exportToFile(): void {
    const blob = new Blob([this.state.exportJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'survey.json'; a.click();
    URL.revokeObjectURL(url);
  }

  protected importFromFile(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { this.importText = reader.result as string; this.importJson(); };
    reader.readAsText(file);
  }

  protected openPreview(): void {
    this.dialog.open(SurveyPreviewDialogComponent, {
      width: '800px', maxWidth: '95vw', maxHeight: '85vh',
      data: { form: this.formDef }, panelClass: 'preview-dialog-container',
    });
  }

  protected openLivePreview(): void {
    if (this.surveyId) this.navigate.emit({ to: 'preview', surveyId: this.surveyId });
    else this.snackBar.open('Save the survey first to preview in new tab', 'Close', { duration: 3000 });
  }

  protected copyShareLink(): void {
    if (this.surveyId) {
      navigator.clipboard.writeText(`${window.location.origin}/s/${this.surveyId}`);
      this.snackBar.open('Share link copied!', 'Close', { duration: 2000 });
    }
  }

  protected goToDashboard(): void { this.navigate.emit({ to: 'dashboard' }); }
  protected viewResponses(): void { if (this.surveyId) this.navigate.emit({ to: 'responses', surveyId: this.surveyId }); }

  protected getTotalQuestions(): number {
    return this.formDef.pages.reduce((sum, page) => sum + page.elements.length, 0);
  }

  protected toggleComponentPanel(): void { this.showComponentPanel = !this.showComponentPanel; }

  protected deletePage(index: number): void {
    if (this.formDef.pages.length > 1) {
      this.state.deletePage(index);
      if (this.selectedPage >= this.formDef.pages.length) this.selectedPage = this.formDef.pages.length - 1;
      this.snackBar.open('Page deleted', 'Close', { duration: 2000 });
    }
  }

  protected getQuestionIcon(type: MWTextType): string {
    return this.componentItems.find((c) => c.type === type)?.icon || 'help_outline';
  }

  protected addQuestionFromComponent(type: MWTextType): void {
    const newQuestion: MWQuestion = {
      id: 'q-' + Date.now(),
      text: this.getDefaultQuestionText(type),
      type,
      required: false,
    };
    if (['radio', 'checkbox', 'select'].includes(type)) {
      newQuestion.offeredAnswers = [
        { id: 'opt-1', orderNo: 1, value: 'Option 1' },
        { id: 'opt-2', orderNo: 2, value: 'Option 2' },
        { id: 'opt-3', orderNo: 3, value: 'Option 3' },
      ];
    }
    if (type === 'scale') newQuestion.scale = { min: 1, max: 5, step: 1 };
    if (type === 'rating') newQuestion.scale = { min: 1, max: 5, step: 1 };
    if (type === 'nps') newQuestion.scale = { min: 0, max: 10, step: 1, minLabel: 'Not at all likely', maxLabel: 'Extremely likely' };
    if (type === 'priority') newQuestion.priorityList = [
      { id: 'p1', orderNo: 1, value: 'Item 1' },
      { id: 'p2', orderNo: 2, value: 'Item 2' },
      { id: 'p3', orderNo: 3, value: 'Item 3' },
    ];
    if (type === 'grid') newQuestion.grid = {
      cellInputType: 'radio',
      rows: [{ id: 'row-1', orderNo: 1, label: 'Row 1' }, { id: 'row-2', orderNo: 2, label: 'Row 2' }],
      cols: [{ id: 'col-1', orderNo: 1, label: 'Column 1' }, { id: 'col-2', orderNo: 2, label: 'Column 2' }, { id: 'col-3', orderNo: 3, label: 'Column 3' }],
    };
    if (type === 'file') newQuestion.fileConfig = { accept: ['image/*'], maxSize: 10, multiple: false };
    if (type === 'number') newQuestion.numberConfig = { step: 1 };

    this.state.addQuestion(this.selectedPage, newQuestion);
    this.cdr.detectChanges();
    const newIndex = this.formDef.pages[this.selectedPage].elements.length - 1;
    this.openQuestionDialog(newQuestion, newIndex);
  }

  private getDefaultQuestionText(type: MWTextType): string {
    const labels: Record<MWTextType, string> = {
      text: 'Short answer question', textarea: 'Long answer question',
      radio: 'Multiple choice question', checkbox: 'Checkbox question',
      select: 'Dropdown question', scale: 'Rating question',
      date: 'Date question', time: 'Time question', grid: 'Grid question',
      priority: 'Priority ranking question', email: 'Email address',
      phone: 'Phone number', number: 'Numeric question', url: 'Website URL',
      file: 'File upload', nps: 'How likely are you to recommend us?',
      rating: 'Rate your experience', signature: 'Please sign below',
    };
    return labels[type] || 'New question';
  }

  protected dropFromToolbox(event: CdkDragDrop<ComponentItem[] | MWElement[]>): void {
    if (event.previousContainer === event.container) {
      this.state.reorderQuestion(this.selectedPage, event.previousIndex, event.currentIndex);
    } else {
      this.addQuestionFromComponent(this.componentItems[event.previousIndex].type);
    }
  }

  async saveSurvey(): Promise<void> {
    if (!this.api) {
      this.snackBar.open('No API service configured', 'Close', { duration: 3000 });
      return;
    }
    this.isSaving = true;
    try {
      this.formDef = this.state.getForm();
      const errs = this.state.validateForm(this.formDef);
      if (errs.length) {
        this.snackBar.open('Invalid survey: ' + errs[0], 'Close', { duration: 4000 });
        return;
      }

      if (this.surveyId && this.survey) {
        this.survey = await firstValueFrom(this.api.updateSurvey(this.surveyId, {
          name: this.formDef.name,
          description: this.formDef.description,
          form: this.formDef,
        }));
      } else {
        this.survey = await firstValueFrom(this.api.createSurvey({
          name: this.formDef.name,
          description: this.formDef.description,
          form: this.formDef,
        }));
        this.surveyId = this.survey.id;
        this.saved.emit({ surveyId: this.survey.id });
      }
      this.lastSaved = new Date();
      this.hasUnsavedChanges = false;
      this.snackBar.open('Survey saved!', 'Dismiss', { duration: 3000, horizontalPosition: 'end', verticalPosition: 'top' });
    } catch {
      this.snackBar.open('Failed to save survey', 'Close', { duration: 3000 });
    } finally {
      this.isSaving = false;
    }
  }

  private async autoSave(): Promise<void> {
    if (this.isSaving || !this.surveyId || !this.api) return;
    this.isSaving = true;
    try {
      this.formDef = this.state.getForm();
      if (this.state.validateForm(this.formDef).length) return;
      this.survey = await firstValueFrom(this.api.updateSurvey(this.surveyId, {
        name: this.formDef.name, description: this.formDef.description, form: this.formDef,
      }));
      this.lastSaved = new Date();
      this.hasUnsavedChanges = false;
      this.cdr.markForCheck();
    } catch { /* silent */ } finally {
      this.isSaving = false;
    }
  }

  async publishSurvey(): Promise<void> {
    if (!this.api) return;
    await this.saveSurvey();
    if (!this.surveyId) return;
    this.isPublishing = true;
    try {
      if (this.state.validateForm(this.state.getForm()).length) {
        this.snackBar.open('Fix validation before publishing', 'Close', { duration: 4000 });
        return;
      }
      this.survey = await firstValueFrom(this.api.publishSurvey(this.surveyId));
      this.surveyStatus = 'published';
      const shareUrl = this.survey.shareUrl || `${window.location.origin}/s/${this.surveyId}`;
      this.published.emit({ surveyId: this.surveyId, shareUrl });
      const ref = this.snackBar.open('Survey published!', 'Copy Link', { duration: 5000, horizontalPosition: 'end', verticalPosition: 'top' });
      ref.onAction().subscribe(() => { navigator.clipboard.writeText(shareUrl); this.snackBar.open('Link copied!', 'Close', { duration: 2000 }); });
    } catch {
      this.snackBar.open('Failed to publish survey', 'Close', { duration: 3000 });
    } finally {
      this.isPublishing = false;
    }
  }

  protected openDeveloperPanel(): void {
    if (!this.surveyId) {
      this.snackBar.open('Save the survey first to access developer tools', 'Close', { duration: 3000 });
      return;
    }
    // Host app can listen to navigate event with to:'dashboard' or extend this hook
    this.snackBar.open('Developer tools not available in embedded mode', 'Close', { duration: 3000 });
  }

  async unpublishSurvey(): Promise<void> {
    if (!this.api || !this.surveyId) return;
    try {
      this.survey = await firstValueFrom(this.api.unpublishSurvey(this.surveyId));
      this.surveyStatus = 'draft';
      this.snackBar.open('Survey unpublished', 'Close', { duration: 3000 });
    } catch {
      this.snackBar.open('Failed to unpublish survey', 'Close', { duration: 3000 });
    }
  }
}
