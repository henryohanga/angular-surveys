import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Interface for premium question-by-question flow component
 * This interface must be implemented by the premium-flow submodule
 */
export interface QuestionFlowConfig {
  surveyId: string;
  form: unknown;
  onComplete: (responses: Record<string, unknown>) => void;
  onProgress?: (progress: QuestionFlowProgress) => void;
}

export interface QuestionFlowProgress {
  currentQuestionIndex: number;
  totalQuestions: number;
  percentComplete: number;
  currentQuestionId: string;
}

export interface QuestionFlowState {
  currentQuestionIndex: number;
  questionOrder: string[];
  responses: Record<string, unknown>;
  isComplete: boolean;
}

/**
 * Interface for the premium question flow service
 * This is implemented by the premium-flow submodule
 */
export interface IPremiumFlowService {
  isAvailable(): boolean;
  initialize(config: QuestionFlowConfig): Observable<QuestionFlowState>;
  goToQuestion(questionId: string): Observable<QuestionFlowState>;
  nextQuestion(): Observable<QuestionFlowState>;
  previousQuestion(): Observable<QuestionFlowState>;
  submitResponse(
    questionId: string,
    response: unknown
  ): Observable<QuestionFlowState>;
  getProgress(): Observable<QuestionFlowProgress>;
}

/**
 * Injection token for the premium flow service
 * The premium-flow submodule provides the actual implementation
 */
export const PREMIUM_FLOW_SERVICE = new InjectionToken<IPremiumFlowService>(
  'PREMIUM_FLOW_SERVICE'
);

/**
 * Injection token to check if premium flow is available
 */
export const PREMIUM_FLOW_AVAILABLE = new InjectionToken<boolean>(
  'PREMIUM_FLOW_AVAILABLE'
);
