export type MWTextType =
  | 'text'
  | 'textarea'
  | 'radio'
  | 'checkbox'
  | 'grid'
  | 'priority'
  | 'select'
  | 'date'
  | 'time'
  | 'scale'
  | 'email'
  | 'phone'
  | 'number'
  | 'url'
  | 'file'
  | 'nps'
  | 'rating'
  | 'signature';

export interface MWPageFlow {
  nextPage?: boolean;
  label?: string;
  goToPage?: number;
}

export interface MWOfferedAnswer {
  id: string;
  orderNo: number;
  value: string;
  pageFlow?: MWPageFlow;
  externalValue?: string;
}

export interface MWGridRow {
  id: string;
  orderNo: number;
  label: string;
  externalValue?: string;
}
export interface MWGridCol {
  id: string;
  orderNo: number;
  label: string;
  externalValue?: string;
}

export interface MWGrid {
  cellInputType: 'radio' | 'checkbox';
  rows: MWGridRow[];
  cols: MWGridCol[];
}

export interface MWPriorityItem {
  id: string;
  orderNo: number;
  value: string;
  externalValue?: string;
}

export interface MWFileConfig {
  accept: string[]; // e.g., ['image/*', 'video/*', 'audio/*', '.pdf']
  maxSize?: number; // in MB
  multiple?: boolean;
}

export interface MWNumberConfig {
  min?: number;
  max?: number;
  step?: number;
  prefix?: string; // e.g., '$'
  suffix?: string; // e.g., 'kg'
}

export interface MWQuestion {
  id: string;
  text: string;
  type: MWTextType;
  required?: boolean;
  pageFlowModifier?: boolean;
  offeredAnswers?: MWOfferedAnswer[];
  otherAnswer?: boolean;
  grid?: MWGrid;
  priorityList?: MWPriorityItem[];
  scale?: {
    min: number;
    max: number;
    step?: number;
    minLabel?: string;
    maxLabel?: string;
  };
  fileConfig?: MWFileConfig;
  numberConfig?: MWNumberConfig;
  placeholder?: string;
  externalId?: string;
  externalFieldName?: string;
}

export interface MWElement {
  id: string;
  orderNo: number;
  type: 'question';
  question: MWQuestion;
}

export interface MWPage {
  id: string;
  number: number;
  name?: string | null;
  description?: string | null;
  pageFlow?: MWPageFlow;
  elements: MWElement[];
  namedPage?: boolean;
}

export interface MWForm {
  name: string;
  description?: string;
  pages: MWPage[];
}
