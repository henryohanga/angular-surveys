import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { Router } from '@angular/router';
import {
  IAuthService,
  CurrentUser,
  LoginRequest,
  RegisterRequest,
} from '@angular-surveys/shared-types';

export interface AuthResponse {
  user: CurrentUser;
  accessToken: string;
  tokenType: string;
}

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

@Injectable()
export class LocalAuthService implements IAuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly currentUserSubject = new BehaviorSubject<CurrentUser | null>(null);
  private readonly isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  readonly currentUser$ = this.currentUserSubject.asObservable();
  readonly isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    this.loadStoredAuth();
  }

  private loadStoredAuth(): void {
    const token = localStorage.getItem(TOKEN_KEY);
    const userJson = localStorage.getItem(USER_KEY);

    if (token && userJson) {
      try {
        const user = JSON.parse(userJson) as CurrentUser;
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      } catch {
        this.clearAuth();
      }
    }
  }

  private storeAuth(response: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, response.accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
    this.isAuthenticatedSubject.next(true);
  }

  private clearAuth(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  get currentUser(): CurrentUser | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`/auth/register`, data).pipe(
      tap((response) => {
        this.storeAuth(response);
      })
    );
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    const { email, password } = credentials;
    return this.http
      .post<AuthResponse>(`/auth/login`, { email, password })
      .pipe(
        tap((response) => {
          this.storeAuth(response);
        })
      );
  }

  logout(): void {
    this.clearAuth();
    this.router.navigate(['/']);
  }

  refreshProfile(): Observable<CurrentUser | null> {
    if (!this.token) {
      return of(null);
    }

    return this.http.get<CurrentUser>(`/auth/me`).pipe(
      tap((user) => {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        this.currentUserSubject.next(user);
      }),
      catchError(() => {
        this.clearAuth();
        return of(null);
      })
    );
  }

  hasRole(role: string): boolean {
    return this.currentUser?.role === role;
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }
}
