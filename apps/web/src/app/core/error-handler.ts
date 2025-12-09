import { ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: unknown): void {
    // Skip empty errors (often from zone.js or animation events)
    if (
      !error ||
      (typeof error === 'object' && Object.keys(error).length === 0)
    ) {
      return;
    }

    // Log the actual error for debugging
    if (error instanceof Error) {
      console.error('Application Error:', error.message);
      if (error.stack) {
        console.error('Stack:', error.stack);
      }
    } else {
      console.error('Unknown Error:', error);
    }
  }
}
