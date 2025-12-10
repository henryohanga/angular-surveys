import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface SurveyAnalytics {
  surveyId: string;
  surveyName: string;
  totalResponses: number;
  completionRate: number;
  averageTime: number;
  questionStats: QuestionStats[];
  recentResponses: ResponseRow[];
}

interface QuestionStats {
  questionId: string;
  questionText: string;
  questionType: string;
  answerDistribution: { label: string; value: number; color?: string }[];
}

interface ResponseRow {
  id: string;
  submittedAt: Date;
  [key: string]: unknown;
}

@Component({
  selector: 'app-analytics-dashboard',
  templateUrl: './analytics-dashboard.component.html',
  styleUrls: ['./analytics-dashboard.component.scss'],
})
export class AnalyticsDashboardComponent implements OnInit {
  @Input() surveyId?: string;

  isLoading = true;
  error?: string;
  analytics?: SurveyAnalytics;

  // Mock data for demo
  mockAnalytics: SurveyAnalytics = {
    surveyId: 'demo-survey',
    surveyName: 'Customer Satisfaction Survey',
    totalResponses: 247,
    completionRate: 78,
    averageTime: 245,
    questionStats: [
      {
        questionId: 'q1',
        questionText: 'How satisfied are you with our service?',
        questionType: 'rating',
        answerDistribution: [
          { label: '1 Star', value: 12 },
          { label: '2 Stars', value: 18 },
          { label: '3 Stars', value: 45 },
          { label: '4 Stars', value: 89 },
          { label: '5 Stars', value: 83 },
        ],
      },
      {
        questionId: 'q2',
        questionText: 'Would you recommend us to others?',
        questionType: 'radio',
        answerDistribution: [
          { label: 'Definitely', value: 142, color: '#38ef7d' },
          { label: 'Maybe', value: 71, color: '#fee140' },
          { label: 'No', value: 34, color: '#f5576c' },
        ],
      },
      {
        questionId: 'q3',
        questionText: 'What features do you use most?',
        questionType: 'checkbox',
        answerDistribution: [
          { label: 'Dashboard', value: 198 },
          { label: 'Reports', value: 156 },
          { label: 'Analytics', value: 134 },
          { label: 'Integrations', value: 89 },
          { label: 'API', value: 67 },
        ],
      },
    ],
    recentResponses: [
      {
        id: '1',
        submittedAt: new Date(),
        q1: 5,
        q2: 'Definitely',
        q3: ['Dashboard', 'Reports'],
      },
      {
        id: '2',
        submittedAt: new Date(Date.now() - 3600000),
        q1: 4,
        q2: 'Maybe',
        q3: ['Analytics'],
      },
      {
        id: '3',
        submittedAt: new Date(Date.now() - 7200000),
        q1: 5,
        q2: 'Definitely',
        q3: ['Dashboard'],
      },
    ],
  };

  responseColumns = [
    { key: 'q1', label: 'Satisfaction' },
    { key: 'q2', label: 'Recommend' },
    { key: 'q3', label: 'Features Used' },
  ];

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.surveyId = this.surveyId || this.route.snapshot.params['id'];
    this.loadAnalytics();
  }

  private loadAnalytics(): void {
    this.isLoading = true;

    if (!this.surveyId || this.surveyId === 'demo') {
      // Use mock data for demo
      setTimeout(() => {
        this.analytics = this.mockAnalytics;
        this.isLoading = false;
      }, 500);
      return;
    }

    // Load real data from API
    this.http
      .get<SurveyAnalytics>(
        `${environment.apiUrl}/responses/analytics/${this.surveyId}`
      )
      .subscribe({
        next: (data) => {
          this.analytics = data;
          this.isLoading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to load analytics';
          this.isLoading = false;
        },
      });
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }

  refresh(): void {
    this.loadAnalytics();
  }
}
