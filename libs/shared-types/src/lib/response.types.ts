/**
 * Survey Response Types
 */

export interface SurveyResponse {
  id: string;
  surveyId: string;
  responses: Record<string, ResponseValue>;
  submittedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  metadata?: ResponseMetadata;
  respondentId?: string;
  isComplete: boolean;
  currentPage?: number;
}

export type ResponseValue =
  | string
  | number
  | boolean
  | string[]
  | Record<string, string | string[]>
  | FileUpload
  | SignatureData
  | null;

export interface ResponseMetadata {
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
  deviceType?: 'desktop' | 'tablet' | 'mobile';
  browser?: string;
  os?: string;
  country?: string;
  city?: string;
  completionTime?: number; // in seconds
}

export interface FileUpload {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: Date;
}

export interface SignatureData {
  dataUrl: string;
  timestamp: Date;
}

/**
 * Response Analytics
 */
export interface SurveyAnalytics {
  surveyId: string;
  totalResponses: number;
  completionRate: number;
  averageCompletionTime: number; // seconds
  responsesByDate: DateCount[];
  responsesByDevice: DeviceCount[];
  questionAnalytics: QuestionAnalytics[];
}

export interface DateCount {
  date: string;
  count: number;
}

export interface DeviceCount {
  device: 'desktop' | 'tablet' | 'mobile';
  count: number;
  percentage: number;
}

export interface QuestionAnalytics {
  questionId: string;
  questionText: string;
  questionType: string;
  responseCount: number;
  skipCount: number;
  data: QuestionAnalyticsData;
}

export type QuestionAnalyticsData =
  | ChoiceAnalytics
  | TextAnalytics
  | NumericAnalytics
  | GridAnalytics;

export interface ChoiceAnalytics {
  type: 'choice';
  options: OptionCount[];
}

export interface OptionCount {
  value: string;
  label: string;
  count: number;
  percentage: number;
}

export interface TextAnalytics {
  type: 'text';
  totalResponses: number;
  averageLength: number;
  wordCloud?: WordCloudItem[];
}

export interface WordCloudItem {
  word: string;
  count: number;
}

export interface NumericAnalytics {
  type: 'numeric';
  min: number;
  max: number;
  average: number;
  median: number;
  distribution: { range: string; count: number }[];
}

export interface GridAnalytics {
  type: 'grid';
  rows: {
    rowId: string;
    rowLabel: string;
    distribution: OptionCount[];
  }[];
}

/**
 * Export formats
 */
export type ExportFormat = 'csv' | 'xlsx' | 'json' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  includeMetadata?: boolean;
  dateRange?: {
    from: Date;
    to: Date;
  };
  questionIds?: string[];
}
