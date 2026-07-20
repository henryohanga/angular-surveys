import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-material-survey-page',
  templateUrl: './material-survey.component.html',
  styleUrls: ['./material-survey.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MaterialSurveyComponent {}
