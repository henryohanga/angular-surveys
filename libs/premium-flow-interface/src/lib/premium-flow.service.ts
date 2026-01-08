import { Injectable, Inject, Optional } from '@angular/core';
import {
  IPremiumFlowService,
  PREMIUM_FLOW_SERVICE,
  PREMIUM_FLOW_AVAILABLE,
  QuestionFlowConfig,
  QuestionFlowState,
  QuestionFlowProgress,
} from './premium-flow.interface';
import { Observable, of, throwError } from 'rxjs';

/**
 * Service to check and interact with premium flow features
 * This acts as a facade that delegates to the premium implementation when available
 */
@Injectable({
  providedIn: 'root',
})
export class PremiumFlowService {
  constructor(
    @Optional()
    @Inject(PREMIUM_FLOW_SERVICE)
    private readonly premiumService: IPremiumFlowService | null,
    @Optional()
    @Inject(PREMIUM_FLOW_AVAILABLE)
    private readonly premiumAvailable: boolean | null
  ) {}

  /**
   * Check if the premium question-by-question flow is available
   * Returns true only if the premium-flow submodule is properly installed and configured
   */
  isPremiumFlowAvailable(): boolean {
    if (this.premiumAvailable === true && this.premiumService) {
      return this.premiumService.isAvailable();
    }
    return false;
  }

  /**
   * Initialize the premium question flow
   * @throws Error if premium flow is not available
   */
  initialize(config: QuestionFlowConfig): Observable<QuestionFlowState> {
    if (!this.isPremiumFlowAvailable() || !this.premiumService) {
      return throwError(
        () =>
          new Error(
            'Premium flow is not available. Please ensure the premium-flow submodule is installed.'
          )
      );
    }
    return this.premiumService.initialize(config);
  }

  /**
   * Navigate to a specific question
   */
  goToQuestion(questionId: string): Observable<QuestionFlowState> {
    if (!this.premiumService) {
      return throwError(() => new Error('Premium flow is not available'));
    }
    return this.premiumService.goToQuestion(questionId);
  }

  /**
   * Move to the next question (respects jump rules)
   */
  nextQuestion(): Observable<QuestionFlowState> {
    if (!this.premiumService) {
      return throwError(() => new Error('Premium flow is not available'));
    }
    return this.premiumService.nextQuestion();
  }

  /**
   * Move to the previous question
   */
  previousQuestion(): Observable<QuestionFlowState> {
    if (!this.premiumService) {
      return throwError(() => new Error('Premium flow is not available'));
    }
    return this.premiumService.previousQuestion();
  }

  /**
   * Submit a response for a question
   */
  submitResponse(
    questionId: string,
    response: unknown
  ): Observable<QuestionFlowState> {
    if (!this.premiumService) {
      return throwError(() => new Error('Premium flow is not available'));
    }
    return this.premiumService.submitResponse(questionId, response);
  }

  /**
   * Get the current progress
   */
  getProgress(): Observable<QuestionFlowProgress> {
    if (!this.premiumService) {
      return of({
        currentQuestionIndex: 0,
        totalQuestions: 0,
        percentComplete: 0,
        currentQuestionId: '',
      });
    }
    return this.premiumService.getProgress();
  }
}
