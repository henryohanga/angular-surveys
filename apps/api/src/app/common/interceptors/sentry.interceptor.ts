import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SentryService } from '../services/sentry.service';

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  constructor(private readonly sentryService: SentryService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user } = request;

    // Set user context if available
    if (user?.id) {
      this.sentryService.setUser({
        id: user.id,
        email: user.email,
      });
    }

    // Add request breadcrumb
    this.sentryService.addBreadcrumb({
      category: 'http',
      message: `${method} ${url}`,
      level: 'info',
    });

    return next.handle().pipe(
      catchError((error) => {
        // Capture error to Sentry with context
        this.sentryService.captureException(error, {
          method,
          url,
          userId: user?.id,
        });

        return throwError(() => error);
      })
    );
  }
}
