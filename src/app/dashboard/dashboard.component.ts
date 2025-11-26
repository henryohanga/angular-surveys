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
}
