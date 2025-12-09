import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  StorageService,
  Survey,
  SurveyTemplate,
} from '../core/services/storage.service';
import { BUILT_IN_TEMPLATES } from '../core/data/templates.data';
import { MWForm } from '../surveys/models';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  surveys: Survey[] = [];
  templates: SurveyTemplate[] = [];
  customTemplates: SurveyTemplate[] = [];
  isLoading = true;
  activeTab: 'surveys' | 'templates' = 'surveys';
  searchQuery = '';

  constructor(
    private storage: StorageService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.isLoading = true;
    try {
      this.surveys = await this.storage.getAllSurveys();

      // Load custom templates from storage
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

  get filteredSurveys(): Survey[] {
    if (!this.searchQuery) return this.surveys;
    const query = this.searchQuery.toLowerCase();
    return this.surveys.filter(
      (s) =>
        s.form.name.toLowerCase().includes(query) ||
        s.form.description?.toLowerCase().includes(query)
    );
  }

  get filteredTemplates(): SurveyTemplate[] {
    if (!this.searchQuery) return this.templates;
    const query = this.searchQuery.toLowerCase();
    return this.templates.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)
    );
  }

  async createFromScratch() {
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

    const survey = await this.storage.createSurvey(blankForm);
    this.router.navigate(['/builder', survey.id]);
  }

  async createFromTemplate(template: SurveyTemplate) {
    const form = JSON.parse(JSON.stringify(template.form)); // Deep clone
    const survey = await this.storage.createSurvey(form);
    this.router.navigate(['/builder', survey.id]);
  }

  editSurvey(survey: Survey) {
    this.router.navigate(['/builder', survey.id]);
  }

  async duplicateSurvey(survey: Survey, event: Event) {
    event.stopPropagation();
    try {
      const newSurvey = await this.storage.duplicateSurvey(survey.id);
      this.surveys = [newSurvey, ...this.surveys];
      this.snackBar.open('Survey duplicated', 'Close', { duration: 2000 });
    } catch {
      this.snackBar.open('Failed to duplicate survey', 'Close', {
        duration: 3000,
      });
    }
  }

  async exportResponsesCSV(survey: Survey, event: Event) {
    event.stopPropagation();
    const responses = await this.storage.getResponses(survey.id);
    const questions = survey.form.pages
      .map((p) => p.elements)
      .reduce((acc, cur) => acc.concat(cur), [])
      .map((e) => e.question);

    const header = ['Submitted At', ...questions.map((q) => q.text)];

    const rows = responses.map((r) => {
      const values = questions.map((q) => this.formatAnswer(q, r.responses[q.id]));
      return [new Date(r.submittedAt).toISOString(), ...values];
    });

    const csv = [header, ...rows]
      .map((row) => row.map((cell) => this.escapeCSV(cell)).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(survey.form.name || 'survey').toLowerCase().replace(/\s+/g, '-')}-responses.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private escapeCSV(val: unknown): string {
    const s = String(val ?? '');
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  }

  private formatAnswer(q: import('../surveys/models').MWQuestion, value: unknown): string {
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
            .map((cid) => q.grid!.cols.find((c) => c.id === cid)?.label || String(cid ?? ''))
            .join('|');
          parts.push(`${row.label}: ${labels}`);
        }
      }
      return parts.join(' / ');
    }
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }

  async deleteSurvey(survey: Survey, event: Event) {
    event.stopPropagation();
    if (
      confirm(
        `Are you sure you want to delete "${survey.form.name}"? This action cannot be undone.`
      )
    ) {
      try {
        await this.storage.deleteSurvey(survey.id);
        this.surveys = this.surveys.filter((s) => s.id !== survey.id);
        this.snackBar.open('Survey deleted', 'Close', { duration: 2000 });
      } catch {
        this.snackBar.open('Failed to delete survey', 'Close', {
          duration: 3000,
        });
      }
    }
  }

  previewSurvey(survey: Survey, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/preview', survey.id]);
  }

  viewResponses(survey: Survey, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/responses', survey.id]);
  }

  async togglePublish(survey: Survey, event: Event) {
    event.stopPropagation();
    try {
      if (survey.status === 'published') {
        await this.storage.unpublishSurvey(survey.id);
        survey.status = 'draft';
        survey.shareUrl = undefined;
        this.snackBar.open('Survey unpublished', 'Close', { duration: 2000 });
      } else {
        const updated = await this.storage.publishSurvey(survey.id);
        survey.status = 'published';
        survey.shareUrl = updated.shareUrl;
        survey.publishedAt = updated.publishedAt;
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

  copyShareLink(survey: Survey) {
    if (survey.shareUrl) {
      navigator.clipboard.writeText(survey.shareUrl);
      this.snackBar.open('Link copied to clipboard!', 'Close', {
        duration: 2000,
      });
    }
  }

  getQuestionCount(survey: Survey): number {
    return survey.form.pages.reduce(
      (sum, page) => sum + page.elements.length,
      0
    );
  }

  getTemplateQuestionCount(template: SurveyTemplate): number {
    return template.form.pages.reduce(
      (sum, page) => sum + page.elements.length,
      0
    );
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  async deleteTemplate(template: SurveyTemplate, event: Event) {
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

  trackBySurvey(_i: number, s: Survey): string { return s.id; }
  trackByTemplate(_i: number, t: SurveyTemplate): string { return t.id; }
}
