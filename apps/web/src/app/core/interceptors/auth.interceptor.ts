import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // Prepend API base for relative API paths
    const isAbsolute = /^https?:\/\//i.test(request.url);
    const base = (environment.apiUrl || '/api').replace(/\/+$/, '');
    if (!isAbsolute) {
      const path = request.url.replace(/^\/+/, '');
      request = request.clone({ url: `${base}/${path}` });
    }

    const token = this.authService.token;

    // Add auth header if token exists
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle 401 Unauthorized
        if (error.status === 401) {
          this.authService.logout();
          this.router.navigate(['/login'], {
            queryParams: { returnUrl: this.router.url },
          });
        }

        // Handle 403 Forbidden
        if (error.status === 403) {
          this.router.navigate(['/']);
        }

        return throwError(() => error);
      })
    );
  }
}
