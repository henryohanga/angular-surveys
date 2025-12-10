import { ErrorHandler, Injectable } from '@angular/core';
import * as Sentry from '@sentry/browser';
import { environment } from '../../environments/environment';

// Initialize Sentry for production
if (environment.production && environment.sentryDsn) {
  Sentry.init({
    dsn: environment.sentryDsn,
    environment: 'production',
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.1,
  });
}

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

      // Report to Sentry in production
      if (environment.production && environment.sentryDsn) {
        Sentry.captureException(error);
      }
    } else {
      console.error('Unknown Error:', error);

      // Report unknown errors to Sentry
      if (environment.production && environment.sentryDsn) {
        Sentry.captureMessage(`Unknown error: ${JSON.stringify(error)}`);
      }
    }
  }
}
