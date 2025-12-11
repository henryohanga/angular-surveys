import { Component, OnInit, Input, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

interface ApiResponse {
  id: string;
  surveyId: string;
  responses: Record<string, unknown>;
  submittedAt: string;
  isComplete: boolean;
  metadata?: Record<string, unknown>;
}

interface SurveyAnalytics {
  surveyId: string;
  surveyName?: string;
  totalResponses: number;
  completedResponses: number;
  completionRate: number;
  averageCompletionTime: number;
  responsesByDate: { date: string; count: number }[];
  questionStats?: QuestionStats[];
  recentResponses?: ResponseRow[];
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
  standalone: false,
  selector: 'app-analytics-dashboard',
  templateUrl: './analytics-dashboard.component.html',
  styleUrls: ['./analytics-dashboard.component.scss'],
})
export class AnalyticsDashboardComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);

  @Input() surveyId?: string;

  protected isLoading = true;
  protected error?: string;
  protected analytics?: SurveyAnalytics;

  protected readonly mockAnalytics: SurveyAnalytics = {
    surveyId: 'demo-survey',
    surveyName: 'Customer Satisfaction Survey',
    totalResponses: 247,
    completedResponses: 193,
    completionRate: 78,
    averageCompletionTime: 245,
    responsesByDate: [
      { date: '2025-12-05', count: 42 },
      { date: '2025-12-06', count: 38 },
      { date: '2025-12-07', count: 55 },
      { date: '2025-12-08', count: 48 },
      { date: '2025-12-09', count: 64 },
    ],
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

  protected responseColumns: { key: string; label: string }[] = [];
  protected individualResponses: ResponseRow[] = [];

  ngOnInit(): void {
    this.surveyId = this.surveyId || this.route.snapshot.params['id'];
    this.loadAnalytics();
  }

  private loadAnalytics(): void {
    this.isLoading = true;
    this.error = undefined;

    if (!this.surveyId || this.surveyId === 'demo') {
      // Use mock data for demo
      setTimeout(() => {
        this.analytics = this.mockAnalytics;
        this.isLoading = false;
      }, 500);
      return;
    }

    // Load analytics and individual responses in parallel
    forkJoin({
      analytics: this.http.get<SurveyAnalytics>(
        `/responses/survey/${this.surveyId}/analytics`
      ),
      responses: this.http.get<ApiResponse[]>(
        `/responses/survey/${this.surveyId}`
      ),
    }).subscribe({
      next: ({ analytics, responses }) => {
        this.analytics = {
          ...analytics,
          surveyName: analytics.surveyName || 'Survey Analytics',
          questionStats: analytics.questionStats || [],
          recentResponses: [],
        };

        // Transform API responses to table format
        this.individualResponses = responses.map((r) => ({
          id: r.id,
          submittedAt: new Date(r.submittedAt),
          ...r.responses,
        }));

        // Build columns dynamically from first response
        if (responses.length > 0) {
          const firstResponse = responses[0].responses;
          this.responseColumns = Object.keys(firstResponse).map((key) => ({
            key,
            label: this.formatQuestionKey(key),
          }));
        }

        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load analytics';
        this.isLoading = false;
      },
    });
  }

  protected formatTime(seconds: number): string {
    if (!seconds || seconds === 0) return '—';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  }

  protected formatQuestionKey(key: string): string {
    // Convert question IDs like "q-1234567890" to readable labels
    if (key.startsWith('q-')) {
      return `Question ${key.substring(2, 8)}...`;
    }
    // Convert camelCase or snake_case to Title Case
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }

  protected formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  protected getTodayCount(): number {
    if (!this.analytics?.responsesByDate) return 0;
    const today = new Date().toISOString().split('T')[0];
    const todayData = this.analytics.responsesByDate.find(
      (d) => d.date === today
    );
    return todayData?.count || 0;
  }

  protected getBarHeight(count: number): number {
    if (!this.analytics?.responsesByDate) return 0;
    const maxCount = Math.max(
      ...this.analytics.responsesByDate.map((d) => d.count)
    );
    return maxCount > 0 ? (count / maxCount) * 100 : 0;
  }

  protected copyShareLink(): void {
    if (this.surveyId) {
      const shareUrl = `${window.location.origin}/s/${this.surveyId}`;
      navigator.clipboard.writeText(shareUrl);
      // Could add a snackbar notification here
    }
  }

  protected refresh(): void {
    this.loadAnalytics();
  }
}
