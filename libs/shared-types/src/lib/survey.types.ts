/**
 * Survey Form Types
 * Core data structures for survey definitions
 */

export interface MWForm {
  name: string;
  description?: string;
  pages: MWPage[];
  settings?: SurveySettings;
}

export interface MWPage {
  id: string;
  number: number;
  name?: string;
  description?: string;
  elements: MWElement[];
  pageFlow?: PageFlow;
}

export interface MWElement {
  id: string;
  type: 'question';
  question: MWQuestion;
}

export interface MWQuestion {
  id: string;
  text: string;
  type: QuestionType;
  required?: boolean;
  description?: string;
  placeholder?: string;
  offeredAnswers?: MWOfferedAnswer[];
  scale?: ScaleConfig;
  grid?: GridConfig;
  priorityList?: PriorityItem[];
  pageFlowModifier?: boolean;
  validation?: QuestionValidation;
}

export type QuestionType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'phone'
  | 'number'
  | 'url'
  | 'date'
  | 'time'
  | 'radio'
  | 'checkbox'
  | 'select'
  | 'scale'
  | 'rating'
  | 'nps'
  | 'grid'
  | 'priority'
  | 'file'
  | 'signature';

export interface MWOfferedAnswer {
  id: string;
  value: string;
  label?: string;
  pageFlow?: PageFlow;
}

export interface PageFlow {
  nextPage?: boolean;
  goToPage?: number;
}

export interface ScaleConfig {
  min: number;
  max: number;
  step?: number;
  minLabel?: string;
  maxLabel?: string;
}

export interface GridConfig {
  rows: GridRow[];
  cols: GridColumn[];
  cellInputType: 'radio' | 'checkbox';
}

export interface GridRow {
  id: string;
  label: string;
}

export interface GridColumn {
  id: string;
  label: string;
}

export interface PriorityItem {
  id: string;
  value: string;
  label?: string;
}

export interface QuestionValidation {
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  customMessage?: string;
}

export interface SurveySettings {
  showProgressBar?: boolean;
  allowSaveProgress?: boolean;
  shuffleQuestions?: boolean;
  limitResponses?: number;
  startDate?: string;
  endDate?: string;
  customTheme?: SurveyTheme;
}

export interface SurveyTheme {
  primaryColor?: string;
  backgroundColor?: string;
  fontFamily?: string;
  logoUrl?: string;
}

/**
 * Survey entity for storage
 */
export interface Survey {
  id: string;
  form: MWForm;
  status: SurveyStatus;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  shareUrl?: string;
  responseCount: number;
  ownerId?: string;
  workspaceId?: string;
}

export type SurveyStatus = 'draft' | 'published' | 'archived' | 'closed';

/**
 * Survey Template
 */
export interface SurveyTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  form: MWForm;
  isCustom: boolean;
  isPublic?: boolean;
  createdAt?: Date;
  ownerId?: string;
}

export type TemplateCategory =
  | 'customer-feedback'
  | 'employee'
  | 'market-research'
  | 'education'
  | 'event'
  | 'healthcare'
  | 'general';
