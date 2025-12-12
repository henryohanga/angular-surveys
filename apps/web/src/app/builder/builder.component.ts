import {
  ChangeDetectorRef,
  Component,
  OnInit,
  OnDestroy,
  inject,
} from '@angular/core';
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
import {
  DeveloperPanelComponent,
  DeveloperPanelData,
} from './developer-panel/developer-panel.component';
import { StorageService, Survey } from '../core/services/storage.service';
import { SurveyApiService } from '../core/services/survey-api.service';
import { AuthService } from '../core/services/auth.service';
import { firstValueFrom, Subject, takeUntil, debounceTime, skip } from 'rxjs';

interface ComponentItem {
  type: MWTextType;
  label: string;
  icon: string;
  description: string;
}

@Component({
  standalone: false,
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
export class BuilderComponent implements OnInit, OnDestroy {
  private readonly state = inject(FormStateService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly storage = inject(StorageService);
  private readonly surveyApi = inject(SurveyApiService);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  protected formDef!: MWForm;
  protected survey: Survey | null = null;
  protected surveyId: string | null = null;
  protected selectedPage = 0;
  protected editorOpen = false;
  protected importText = '';
  protected importError: string | null = null;
  protected editingIndex: number | null = null;
  protected editingInitial: MWQuestion | null = null;
  protected isSaving = false;
  protected isPublishing = false;
  protected surveyStatus: 'draft' | 'published' = 'draft';
  protected lastSaved: Date | null = null;
  protected showComponentPanel = true;
  protected isLoading = true;
  protected hasUnsavedChanges = false;
  protected autoSaveEnabled = true;
  private autoSaveDebounceMs = 3000; // 3 seconds

  protected readonly componentItems: ComponentItem[] = [
    // Input types
    {
      type: 'text',
      label: 'Short Text',
      icon: 'short_text',
      description: 'Single line answer',
    },
    {
      type: 'textarea',
      label: 'Long Text',
      icon: 'notes',
      description: 'Paragraph answer',
    },
    {
      type: 'email',
      label: 'Email',
      icon: 'email',
      description: 'Email address',
    },
    {
      type: 'phone',
      label: 'Phone',
      icon: 'phone',
      description: 'Phone number',
    },
    {
      type: 'number',
      label: 'Number',
      icon: 'pin',
      description: 'Numeric input',
    },
    { type: 'url', label: 'Website', icon: 'link', description: 'URL input' },
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
    // Choice types
    {
      type: 'radio',
      label: 'Single Choice',
      icon: 'radio_button_checked',
      description: 'Select one',
    },
    {
      type: 'checkbox',
      label: 'Multiple Choice',
      icon: 'check_box',
      description: 'Select multiple',
    },
    {
      type: 'select',
      label: 'Dropdown',
      icon: 'arrow_drop_down_circle',
      description: 'Dropdown list',
    },
    // Advanced types
    {
      type: 'scale',
      label: 'Linear Scale',
      icon: 'linear_scale',
      description: 'Scale rating',
    },
    {
      type: 'rating',
      label: 'Star Rating',
      icon: 'star',
      description: '5-star rating',
    },
    {
      type: 'nps',
      label: 'NPS Score',
      icon: 'speed',
      description: '0-10 score',
    },
    {
      type: 'grid',
      label: 'Matrix Grid',
      icon: 'grid_on',
      description: 'Grid questions',
    },
    {
      type: 'priority',
      label: 'Ranking',
      icon: 'format_list_numbered',
      description: 'Rank items',
    },
    // Media types
    {
      type: 'file',
      label: 'File Upload',
      icon: 'cloud_upload',
      description: 'Upload files',
    },
    {
      type: 'signature',
      label: 'Signature',
      icon: 'gesture',
      description: 'Draw signature',
    },
  ];

  async ngOnInit(): Promise<void> {
    // Subscribe to form state changes for reactive updates
    this.state.form$.pipe(takeUntil(this.destroy$)).subscribe((form) => {
      this.formDef = form;
      this.cdr.markForCheck();
    });

    // Auto-save: debounce form changes and save automatically
    this.state.form$
      .pipe(
        takeUntil(this.destroy$),
        skip(1), // Skip initial emission
        debounceTime(this.autoSaveDebounceMs)
      )
      .subscribe(() => {
        if (this.autoSaveEnabled && this.surveyId && !this.isSaving) {
          this.autoSave();
        } else if (!this.surveyId) {
          // Mark as having unsaved changes for new surveys
          this.hasUnsavedChanges = true;
          this.cdr.markForCheck();
        }
      });

    // Track unsaved changes on any form modification
    this.state.form$.pipe(takeUntil(this.destroy$), skip(1)).subscribe(() => {
      this.hasUnsavedChanges = true;
      this.cdr.markForCheck();
    });

    this.surveyId = this.route.snapshot.paramMap.get('id');

    if (this.surveyId) {
      // Load existing survey
      try {
        if (this.authService.isAuthenticated) {
          const apiSurvey = await firstValueFrom(
            this.surveyApi.getSurvey(this.surveyId)
          );
          this.survey = this.surveyApi.toLocalSurvey(apiSurvey);
        } else {
          this.survey = await this.storage.getSurvey(this.surveyId);
        }

        if (this.survey) {
          this.state.importJson(JSON.stringify(this.survey.form));
          this.formDef = this.state.getForm(); // Always reference state's form
          this.surveyStatus = this.survey.status;
          this.lastSaved = this.survey.updatedAt;
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected addPage(): void {
    this.state.addPage();
    this.selectedPage = this.formDef.pages.length - 1;
  }

  protected openEditor(): void {
    this.editorOpen = true;
  }

  protected closeEditor(): void {
    this.editorOpen = false;
    this.editingIndex = null;
    this.editingInitial = null;
  }

  protected openQuestionDialog(question?: MWQuestion, index?: number): void {
    const dialogData: QuestionDialogData = {
      question: question,
      pageNumbers: this.formDef.pages.map((p) => p.number),
      mode: question ? 'edit' : 'create',
    };

    const dialogRef = this.dialog.open(QuestionDialogComponent, {
      width: '680px',
      maxWidth: '95vw',
      maxHeight: '85vh',
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
        this.cdr.detectChanges();
      }
    });
  }

  protected addQuestion(q: MWQuestion): void {
    if (this.editingIndex !== null) {
      this.state.updateQuestion(this.selectedPage, this.editingIndex, q);
      this.editingIndex = null;
      this.editingInitial = null;
    } else {
      this.state.addQuestion(this.selectedPage, q);
    }
    this.closeEditor();
    this.cdr.detectChanges();
  }

  protected editQuestion(i: number): void {
    const el = this.formDef.pages[this.selectedPage].elements[i];
    // Use the new dialog instead
    this.openQuestionDialog(el.question, i);
  }

  protected duplicateQuestion(i: number): void {
    const el = this.formDef.pages[this.selectedPage].elements[i];
    const duplicate: MWQuestion = {
      ...JSON.parse(JSON.stringify(el.question)),
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
    this.state.reorderQuestion(
      this.selectedPage,
      e.previousIndex,
      e.currentIndex
    );
    this.cdr.detectChanges();
  }

  protected exportJson(): void {
    this.importText = this.state.exportJson();
    this.importError = null;
  }

  protected importJson(): void {
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

  protected updatePageName(name: string): void {
    this.state.updatePageMeta(this.selectedPage, { name });
  }

  protected updatePageDescription(description: string): void {
    this.state.updatePageMeta(this.selectedPage, { description });
  }

  protected updateSurveyName(name: string): void {
    this.formDef.name = name;
    this.state.importJson(JSON.stringify(this.formDef));
  }

  protected updateSurveyDescription(description: string): void {
    this.formDef.description = description;
    this.state.importJson(JSON.stringify(this.formDef));
  }

  protected formatTimeAgo(date: Date): string {
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

  protected updateNamedPage(namedPage: boolean): void {
    this.state.updatePageMeta(this.selectedPage, { namedPage });
  }

  protected setPageGoTo(goToPage: number | null): void {
    this.state.updatePageFlow(this.selectedPage, {
      goToPage: goToPage ?? undefined,
      nextPage: !goToPage
        ? this.formDef.pages[this.selectedPage].pageFlow?.nextPage
        : false,
    });
  }

  protected setPageNext(nextPage: boolean): void {
    this.state.updatePageFlow(this.selectedPage, {
      nextPage,
      goToPage: nextPage
        ? undefined
        : this.formDef.pages[this.selectedPage].pageFlow?.goToPage,
    });
  }

  protected pageNumbers(): number[] {
    return this.formDef.pages.map((p) => p.number);
  }

  protected exportToFile(): void {
    const data = this.state.exportJson();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'survey.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  protected importFromFile(event: Event): void {
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

  protected openPreview(): void {
    this.dialog.open(SurveyPreviewDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '85vh',
      data: { form: this.formDef },
      panelClass: 'preview-dialog-container',
    });
  }

  protected async saveSurvey(): Promise<void> {
    this.isSaving = true;
    try {
      // Sync formDef with state
      this.formDef = this.state.getForm();

      const errs = this.state.validateForm(this.formDef);
      if (errs.length) {
        this.snackBar.open('Invalid survey: ' + errs[0], 'Close', {
          duration: 4000,
        });
        return;
      }

      if (this.authService.isAuthenticated) {
        // Use API when authenticated
        if (this.surveyId && this.survey) {
          const apiSurvey = await firstValueFrom(
            this.surveyApi.updateSurvey(this.surveyId, {
              name: this.formDef.name,
              description: this.formDef.description,
              form: this.formDef,
            })
          );
          this.survey = this.surveyApi.toLocalSurvey(apiSurvey);
        } else {
          const apiSurvey = await firstValueFrom(
            this.surveyApi.createSurvey({
              name: this.formDef.name,
              description: this.formDef.description,
              form: this.formDef,
            })
          );
          this.survey = this.surveyApi.toLocalSurvey(apiSurvey);
          this.surveyId = this.survey.id;
          this.router.navigate(['/builder', this.surveyId], {
            replaceUrl: true,
          });
        }
      } else {
        // Use local storage for unauthenticated users
        if (this.surveyId && this.survey) {
          this.survey.form = this.formDef;
          this.survey = await this.storage.saveSurvey(this.survey);
        } else {
          this.survey = await this.storage.createSurvey(this.formDef);
          this.surveyId = this.survey.id;
          this.router.navigate(['/builder', this.surveyId], {
            replaceUrl: true,
          });
        }
      }

      this.lastSaved = new Date();
      this.hasUnsavedChanges = false;
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

  /** Silent auto-save without snackbar notifications */
  private async autoSave(): Promise<void> {
    if (this.isSaving || !this.surveyId) return;

    this.isSaving = true;
    try {
      this.formDef = this.state.getForm();
      const errs = this.state.validateForm(this.formDef);
      if (errs.length) {
        // Don't auto-save invalid forms, but don't show error
        return;
      }

      if (this.authService.isAuthenticated && this.survey) {
        const apiSurvey = await firstValueFrom(
          this.surveyApi.updateSurvey(this.surveyId, {
            name: this.formDef.name,
            description: this.formDef.description,
            form: this.formDef,
          })
        );
        this.survey = this.surveyApi.toLocalSurvey(apiSurvey);
      } else if (this.survey) {
        this.survey.form = this.formDef;
        this.survey = await this.storage.saveSurvey(this.survey);
      }

      this.lastSaved = new Date();
      this.hasUnsavedChanges = false;
      this.cdr.markForCheck();
    } catch {
      // Silent fail for auto-save - user can manually save
    } finally {
      this.isSaving = false;
    }
  }

  protected async publishSurvey(): Promise<void> {
    // Always save before publishing to ensure latest changes are included
    await this.saveSurvey();

    if (!this.surveyId) return;

    this.isPublishing = true;
    try {
      const errs = this.state.validateForm(this.state.getForm());
      if (errs.length) {
        this.snackBar.open('Fix validation before publishing', 'Close', {
          duration: 4000,
        });
        this.isPublishing = false;
        return;
      }

      let shareUrl: string;
      if (this.authService.isAuthenticated) {
        const apiSurvey = await firstValueFrom(
          this.surveyApi.publishSurvey(this.surveyId)
        );
        this.survey = this.surveyApi.toLocalSurvey(apiSurvey);
        shareUrl = `${window.location.origin}/s/${apiSurvey.id}`;
        this.survey.shareUrl = shareUrl;
      } else {
        this.survey = await this.storage.publishSurvey(this.surveyId);
        shareUrl =
          this.survey.shareUrl ||
          `${window.location.origin}/s/${this.surveyId}`;
      }
      this.surveyStatus = 'published';

      const snackRef = this.snackBar.open('Survey published!', 'Copy Link', {
        duration: 5000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });

      snackRef.onAction().subscribe(() => {
        if (shareUrl) {
          navigator.clipboard.writeText(shareUrl);
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

  protected goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  protected openLivePreview(): void {
    if (this.surveyId) {
      window.open(`/preview/${this.surveyId}`, '_blank');
    } else {
      this.snackBar.open(
        'Save the survey first to preview in new tab',
        'Close',
        {
          duration: 3000,
        }
      );
    }
  }

  protected copyShareLink(): void {
    if (this.surveyId) {
      const shareUrl = `${window.location.origin}/s/${this.surveyId}`;
      navigator.clipboard.writeText(shareUrl);
      this.snackBar.open('Share link copied to clipboard!', 'Close', {
        duration: 2000,
      });
    }
  }

  protected viewResponses(): void {
    if (this.surveyId) {
      this.router.navigate(['/responses', this.surveyId]);
    }
  }

  protected async unpublishSurvey(): Promise<void> {
    if (!this.surveyId) return;

    try {
      if (this.authService.isAuthenticated) {
        const apiSurvey = await firstValueFrom(
          this.surveyApi.unpublishSurvey(this.surveyId)
        );
        this.survey = this.surveyApi.toLocalSurvey(apiSurvey);
      } else {
        this.survey = await this.storage.unpublishSurvey(this.surveyId);
      }
      this.surveyStatus = 'draft';
      this.snackBar.open('Survey unpublished', 'Close', { duration: 3000 });
    } catch {
      this.snackBar.open('Failed to unpublish survey', 'Close', {
        duration: 3000,
      });
    }
  }

  protected addQuestionFromComponent(type: MWTextType): void {
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

    // Add default for star rating
    if (type === 'rating') {
      newQuestion.scale = { min: 1, max: 5, step: 1 };
    }

    // Add default for NPS
    if (type === 'nps') {
      newQuestion.scale = {
        min: 0,
        max: 10,
        step: 1,
        minLabel: 'Not at all likely',
        maxLabel: 'Extremely likely',
      };
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

    // Add default file config
    if (type === 'file') {
      newQuestion.fileConfig = {
        accept: ['image/*'],
        maxSize: 10,
        multiple: false,
      };
    }

    // Add default number config
    if (type === 'number') {
      newQuestion.numberConfig = { step: 1 };
    }

    this.state.addQuestion(this.selectedPage, newQuestion);
    this.cdr.detectChanges();

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
      email: 'Email address',
      phone: 'Phone number',
      number: 'Numeric question',
      url: 'Website URL',
      file: 'File upload',
      nps: 'How likely are you to recommend us?',
      rating: 'Rate your experience',
      signature: 'Please sign below',
    };
    return labels[type] || 'New question';
  }

  protected dropFromToolbox(
    event: CdkDragDrop<ComponentItem[] | MWElement[]>
  ): void {
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

  protected getQuestionIcon(type: MWTextType): string {
    const item = this.componentItems.find((c) => c.type === type);
    return item?.icon || 'help_outline';
  }

  protected toggleComponentPanel(): void {
    this.showComponentPanel = !this.showComponentPanel;
  }

  protected deletePage(index: number): void {
    if (this.formDef.pages.length > 1) {
      this.state.deletePage(index);
      if (this.selectedPage >= this.formDef.pages.length) {
        this.selectedPage = this.formDef.pages.length - 1;
      }
      this.snackBar.open('Page deleted', 'Close', { duration: 2000 });
    }
  }

  protected getTotalQuestions(): number {
    return this.formDef.pages.reduce(
      (sum, page) => sum + page.elements.length,
      0
    );
  }

  protected openDeveloperPanel(): void {
    if (!this.surveyId) {
      this.snackBar.open(
        'Save the survey first to access developer tools',
        'Close',
        {
          duration: 3000,
        }
      );
      return;
    }

    const dialogData: DeveloperPanelData = {
      surveyId: this.surveyId,
    };

    this.dialog.open(DeveloperPanelComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '85vh',
      data: dialogData,
      panelClass: 'developer-panel-container',
    });
  }
}
