import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SurveyBuilderModule, SURVEY_BUILDER_API, BuilderNavigateEvent } from '@angular-surveys/survey-builder';
import { BuilderApiAdapterService } from './builder-api-adapter.service';
import { SurveyApiService } from '../core/services/survey-api.service';

@Component({
  standalone: true,
  imports: [SurveyBuilderModule],
  selector: 'app-builder-page',
  template: `
    <as-survey-builder
      [surveyId]="surveyId ?? undefined"
      (navigate)="onNavigate($event)"
      (saved)="onSaved($event)"
    ></as-survey-builder>
  `,
  styles: [`:host { display: block; height: 100%; }`],
  providers: [
    BuilderApiAdapterService,
    { provide: SURVEY_BUILDER_API, useExisting: BuilderApiAdapterService },
    SurveyApiService,
  ],
})
export class BuilderPageComponent implements OnInit {
  protected surveyId: string | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.surveyId = this.route.snapshot.paramMap.get('id');
  }

  protected onNavigate(event: BuilderNavigateEvent): void {
    switch (event.to) {
      case 'dashboard': this.router.navigate(['/dashboard']); break;
      case 'responses': this.router.navigate(['/responses', event.surveyId]); break;
      case 'preview': window.open(`/preview/${event.surveyId}`, '_blank'); break;
    }
  }

  protected onSaved(event: { surveyId: string }): void {
    this.router.navigate(['/builder', event.surveyId], { replaceUrl: true });
  }
}
