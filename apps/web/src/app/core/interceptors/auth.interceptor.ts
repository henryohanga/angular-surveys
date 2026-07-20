import { Injectable, Inject, Optional } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { IAuthService, IWorkspaceService } from '@angular-surveys/shared-types';
import { AUTH_SERVICE, WORKSPACE_SERVICE, AUTH_ROUTES, DEFAULT_AUTH_ROUTES } from '../tokens';
import { environment } from '../../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    @Inject(AUTH_SERVICE) private authService: IAuthService,
    @Optional() @Inject(WORKSPACE_SERVICE) private workspaceService: IWorkspaceService | null,
    @Optional() @Inject(AUTH_ROUTES) private routes: typeof DEFAULT_AUTH_ROUTES | null,
    private router: Router
  ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const isAbsolute = /^https?:\/\//i.test(request.url);
    const base = (environment.apiUrl || '/api').replace(/\/+$/, '');
    if (!isAbsolute) {
      const path = request.url.replace(/^\/+/, '');
      request = request.clone({ url: `${base}/${path}` });
    }

    const headers: Record<string, string> = {};

    const token = this.authService.token;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const workspaceId = this.workspaceService?.workspaceId;
    if (workspaceId) {
      headers['X-Workspace-Id'] = workspaceId;
    }

    if (Object.keys(headers).length > 0) {
      request = request.clone({ setHeaders: headers });
    }

    const loginRoute = this.routes?.login ?? DEFAULT_AUTH_ROUTES.login;

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.authService.logout();
          this.router.navigate([loginRoute], {
            queryParams: { returnUrl: this.router.url },
          });
        }

        if (error.status === 403) {
          this.router.navigate(['/']);
        }

        return throwError(() => error);
      })
    );
  }
}
