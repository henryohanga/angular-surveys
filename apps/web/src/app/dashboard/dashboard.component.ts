import { Component, OnInit, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  StorageService,
  Survey,
  SurveyTemplate,
} from '../core/services/storage.service';
import { SurveyApiService } from '../core/services/survey-api.service';
import { AuthService } from '../core/services/auth.service';
import { BUILT_IN_TEMPLATES } from '../core/data/templates.data';
import { MWForm } from '../surveys/models';
import { firstValueFrom } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  private readonly storage = inject(StorageService);
  private readonly surveyApi = inject(SurveyApiService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected surveys: Survey[] = [];
  protected templates: SurveyTemplate[] = [];
  protected customTemplates: SurveyTemplate[] = [];
  protected isLoading = true;
  protected activeTab: 'surveys' | 'templates' = 'surveys';
  protected searchQuery = '';

  async ngOnInit() {
    await this.loadData();

    // Check for template query param from home page
    const templateId = this.route.snapshot.queryParams['template'];
    if (templateId) {
      const template = this.templates.find((t) => t.id === templateId);
      if (template) {
        this.createFromTemplate(template);
      }
    }
  }

  protected async loadData(): Promise<void> {
    this.isLoading = true;
    try {
      if (this.authService.isAuthenticated) {
        // Load from API when authenticated
        const apiSurveys = await firstValueFrom(this.surveyApi.getAllSurveys());
        this.surveys = apiSurveys.map((s) => this.surveyApi.toLocalSurvey(s));
      } else {
        // Fall back to local storage for unauthenticated users
        this.surveys = await this.storage.getAllSurveys();
      }

      // Load custom templates from storage (templates are local-only for now)
      const storedTemplates = await this.storage.getAllTemplates();
      this.customTemplates = storedTemplates.filter((t) => t.isCustom);

      // Combine built-in and custom templates
      this.templates = [...BUILT_IN_TEMPLATES, ...this.customTemplates];
    } catch (error) {
      console.error('Failed to load data:', error);
      this.snackBar.open('Failed to load data', 'Close', { duration: 3000 });
    } finally {
      this.isLoading = false;
    }
  }

  protected get filteredSurveys(): Survey[] {
    if (!this.searchQuery) return this.surveys;
    const query = this.searchQuery.toLowerCase();
    return this.surveys.filter(
      (s) =>
        s.form.name.toLowerCase().includes(query) ||
        s.form.description?.toLowerCase().includes(query)
    );
  }

  protected get filteredTemplates(): SurveyTemplate[] {
    if (!this.searchQuery) return this.templates;
    const query = this.searchQuery.toLowerCase();
    return this.templates.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)
    );
  }

  protected async createFromScratch(): Promise<void> {
    const blankForm: MWForm = {
      name: 'Untitled Survey',
      description: '',
      pages: [
        {
          id: 'page-1',
          number: 1,
          name: null,
          description: null,
          namedPage: false,
          pageFlow: { nextPage: true },
          elements: [],
        },
      ],
    };

    try {
      let surveyId: string;
      if (this.authService.isAuthenticated) {
        const apiSurvey = await firstValueFrom(
          this.surveyApi.createSurvey({
            name: blankForm.name,
            description: blankForm.description,
            form: blankForm,
          })
        );
        surveyId = apiSurvey.id;
      } else {
        const survey = await this.storage.createSurvey(blankForm);
        surveyId = survey.id;
      }
      this.router.navigate(['/builder', surveyId]);
    } catch (error) {
      console.error('Failed to create survey:', error);
      this.snackBar.open('Failed to create survey', 'Close', {
        duration: 3000,
      });
    }
  }

  protected async createFromTemplate(template: SurveyTemplate): Promise<void> {
    const form = JSON.parse(JSON.stringify(template.form)) as MWForm; // Deep clone
    try {
      let surveyId: string;
      if (this.authService.isAuthenticated) {
        const apiSurvey = await firstValueFrom(
          this.surveyApi.createSurvey({
            name: form.name,
            description: form.description,
            form,
          })
        );
        surveyId = apiSurvey.id;
      } else {
        const survey = await this.storage.createSurvey(form);
        surveyId = survey.id;
      }
      this.router.navigate(['/builder', surveyId]);
    } catch (error) {
      console.error('Failed to create survey from template:', error);
      this.snackBar.open('Failed to create survey', 'Close', {
        duration: 3000,
      });
    }
  }

  protected editSurvey(survey: Survey): void {
    this.router.navigate(['/builder', survey.id]);
  }

  protected async duplicateSurvey(survey: Survey, event: Event): Promise<void> {
    event.stopPropagation();
    try {
      let newSurvey: Survey;
      if (this.authService.isAuthenticated) {
        const apiSurvey = await firstValueFrom(
          this.surveyApi.duplicateSurvey(survey.id)
        );
        newSurvey = this.surveyApi.toLocalSurvey(apiSurvey);
      } else {
        newSurvey = await this.storage.duplicateSurvey(survey.id);
      }
      this.surveys = [newSurvey, ...this.surveys];
      this.snackBar.open('Survey duplicated', 'Close', { duration: 2000 });
    } catch {
      this.snackBar.open('Failed to duplicate survey', 'Close', {
        duration: 3000,
      });
    }
  }

  protected async exportResponsesCSV(
    survey: Survey,
    event: Event
  ): Promise<void> {
    event.stopPropagation();
    let responses;
    if (this.authService.isAuthenticated) {
      const apiResponses = await firstValueFrom(
        this.surveyApi.getResponses(survey.id)
      );
      responses = apiResponses.map((r) => this.surveyApi.toLocalResponse(r));
    } else {
      responses = await this.storage.getResponses(survey.id);
    }
    const questions = survey.form.pages
      .map((p) => p.elements)
      .reduce((acc, cur) => acc.concat(cur), [])
      .map((e) => e.question);

    const header = ['Submitted At', ...questions.map((q) => q.text)];

    const rows = responses.map((r) => {
      const values = questions.map((q) =>
        this.formatAnswer(q, r.responses[q.id])
      );
      return [new Date(r.submittedAt).toISOString(), ...values];
    });

    const csv = [header, ...rows]
      .map((row) => row.map((cell) => this.escapeCSV(cell)).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(survey.form.name || 'survey')
      .toLowerCase()
      .replace(/\s+/g, '-')}-responses.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private escapeCSV(val: unknown): string {
    const s = String(val ?? '');
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  }

  private formatAnswer(
    q: import('../surveys/models').MWQuestion,
    value: unknown
  ): string {
    if (value == null) return '';
    if (q.type === 'radio' || q.type === 'select') {
      const v = typeof value === 'string' ? value : '';
      const found = q.offeredAnswers?.find((a) => a.value === v);
      return found ? found.value : v;
    }
    if (q.type === 'checkbox') {
      const arr = Array.isArray(value) ? (value as unknown[]) : [];
      return arr.map((v) => String(v ?? '')).join('; ');
    }
    if (q.type === 'grid' && q.grid) {
      const obj = value as Record<string, unknown>;
      const parts: string[] = [];
      for (const row of q.grid.rows) {
        const rv = obj?.[row.id];
        if (q.grid.cellInputType === 'radio') {
          const col = q.grid.cols.find((c) => c.id === rv);
          parts.push(`${row.label}: ${col ? col.label : String(rv ?? '')}`);
        } else {
          const arr = Array.isArray(rv) ? (rv as unknown[]) : [];
          const labels = arr
            .map(
              (cid) =>
                q.grid!.cols.find((c) => c.id === cid)?.label ||
                String(cid ?? '')
            )
            .join('|');
          parts.push(`${row.label}: ${labels}`);
        }
      }
      return parts.join(' / ');
    }
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }

  protected async deleteSurvey(survey: Survey, event: Event): Promise<void> {
    event.stopPropagation();
    if (
      confirm(
        `Are you sure you want to delete "${survey.form.name}"? This action cannot be undone.`
      )
    ) {
      try {
        if (this.authService.isAuthenticated) {
          await firstValueFrom(this.surveyApi.deleteSurvey(survey.id));
        } else {
          await this.storage.deleteSurvey(survey.id);
        }
        this.surveys = this.surveys.filter((s) => s.id !== survey.id);
        this.snackBar.open('Survey deleted', 'Close', { duration: 2000 });
      } catch {
        this.snackBar.open('Failed to delete survey', 'Close', {
          duration: 3000,
        });
      }
    }
  }

  protected previewSurvey(survey: Survey, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/preview', survey.id]);
  }

  protected viewResponses(survey: Survey, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/responses', survey.id]);
  }

  protected async togglePublish(survey: Survey, event: Event): Promise<void> {
    event.stopPropagation();
    try {
      if (survey.status === 'published') {
        if (this.authService.isAuthenticated) {
          await firstValueFrom(this.surveyApi.unpublishSurvey(survey.id));
        } else {
          await this.storage.unpublishSurvey(survey.id);
        }
        survey.status = 'draft';
        survey.shareUrl = undefined;
        this.snackBar.open('Survey unpublished', 'Close', { duration: 2000 });
      } else {
        let shareUrl: string;
        if (this.authService.isAuthenticated) {
          const updated = await firstValueFrom(
            this.surveyApi.publishSurvey(survey.id)
          );
          shareUrl = `${window.location.origin}/s/${updated.id}`;
          survey.publishedAt = updated.publishedAt
            ? new Date(updated.publishedAt)
            : new Date();
        } else {
          const updated = await this.storage.publishSurvey(survey.id);
          shareUrl =
            updated.shareUrl || `${window.location.origin}/s/${survey.id}`;
          survey.publishedAt = updated.publishedAt;
        }
        survey.status = 'published';
        survey.shareUrl = shareUrl;
        this.snackBar
          .open('Survey published!', 'Copy Link', { duration: 5000 })
          .onAction()
          .subscribe(() => this.copyShareLink(survey));
      }
    } catch {
      this.snackBar.open('Failed to update survey', 'Close', {
        duration: 3000,
      });
    }
  }

  protected copyShareLink(survey: Survey): void {
    if (survey.shareUrl) {
      const completeShareUrl = `${window.location.origin}${survey.shareUrl}`;

      navigator.clipboard.writeText(completeShareUrl);
      this.snackBar.open('Link copied to clipboard!', 'Close', {
        duration: 2000,
      });
    }
  }

  protected getQuestionCount(survey: Survey): number {
    return survey.form.pages.reduce(
      (sum, page) => sum + page.elements.length,
      0
    );
  }

  protected getTemplateQuestionCount(template: SurveyTemplate): number {
    return template.form.pages.reduce(
      (sum, page) => sum + page.elements.length,
      0
    );
  }

  protected formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  protected async deleteTemplate(
    template: SurveyTemplate,
    event: Event
  ): Promise<void> {
    event.stopPropagation();
    if (!template.isCustom) {
      this.snackBar.open('Built-in templates cannot be deleted', 'Close', {
        duration: 3000,
      });
      return;
    }

    if (confirm(`Delete template "${template.name}"?`)) {
      try {
        await this.storage.deleteTemplate(template.id);
        this.templates = this.templates.filter((t) => t.id !== template.id);
        this.customTemplates = this.customTemplates.filter(
          (t) => t.id !== template.id
        );
        this.snackBar.open('Template deleted', 'Close', { duration: 2000 });
      } catch {
        this.snackBar.open('Failed to delete template', 'Close', {
          duration: 3000,
        });
      }
    }
  }

  protected trackBySurvey(_i: number, s: Survey): string {
    return s.id;
  }
  protected trackByTemplate(_i: number, t: SurveyTemplate): string {
    return t.id;
  }
}
