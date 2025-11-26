export type MWTextType =
  | 'text'
  | 'textarea'
  | 'radio'
  | 'checkbox'
  | 'grid'
  | 'priority';

export interface MWPageFlow {
  nextPage?: boolean;
  label?: string;
}

export interface MWOfferedAnswer {
  id: string;
  orderNo: number;
  value: string;
  pageFlow?: MWPageFlow;
}

export interface MWGridRow {
  id: string;
  orderNo: number;
  label: string;
}
export interface MWGridCol {
  id: string;
  orderNo: number;
  label: string;
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
