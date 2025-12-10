import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';

@Injectable()
export class SentryService implements OnModuleInit {
  private readonly logger = new Logger(SentryService.name);
  private isInitialized = false;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const dsn = this.configService.get<string>('SENTRY_DSN');

    if (dsn) {
      Sentry.init({
        dsn,
        environment: this.configService.get('NODE_ENV', 'development'),
        release: this.configService.get('APP_VERSION', '1.0.0'),
        tracesSampleRate: this.configService.get(
          'SENTRY_TRACES_SAMPLE_RATE',
          0.1
        ),
        integrations: [
          // Add any additional integrations here
        ],
        beforeSend(event) {
          // Sanitize sensitive data before sending
          if (event.request?.headers) {
            delete event.request.headers['authorization'];
            delete event.request.headers['cookie'];
          }
          return event;
        },
      });

      this.isInitialized = true;
      this.logger.log('Sentry error monitoring initialized');
    } else {
      this.logger.warn('Sentry DSN not configured, error monitoring disabled');
    }
  }

  captureException(error: Error, context?: Record<string, unknown>): void {
    if (!this.isInitialized) {
      return;
    }

    Sentry.withScope((scope) => {
      if (context) {
        scope.setExtras(context);
      }
      Sentry.captureException(error);
    });
  }

  captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): void {
    if (!this.isInitialized) {
      return;
    }

    Sentry.captureMessage(message, level);
  }

  setUser(user: { id: string; email?: string; username?: string }): void {
    if (!this.isInitialized) {
      return;
    }

    Sentry.setUser(user);
  }

  addBreadcrumb(breadcrumb: Sentry.Breadcrumb): void {
    if (!this.isInitialized) {
      return;
    }

    Sentry.addBreadcrumb(breadcrumb);
  }
}
