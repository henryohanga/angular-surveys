import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'viewer';
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  tokenType: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly apiUrl = environment.apiUrl || 'http://localhost:3000/api';
  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
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
        const user = JSON.parse(userJson) as User;
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

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  register(data: RegisterData): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/register`, data)
      .pipe(
        tap((response) => {
          this.storeAuth(response);
        })
      );
  }

  login(
    credentials: LoginCredentials & { rememberMe?: boolean }
  ): Observable<AuthResponse> {
    // Only send email and password to API (backend rejects extra fields)
    const { email, password } = credentials;
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password })
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

  refreshProfile(): Observable<User | null> {
    if (!this.token) {
      return of(null);
    }

    return this.http.get<User>(`${this.apiUrl}/auth/me`).pipe(
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

  // Check if user has a specific role
  hasRole(role: string): boolean {
    return this.currentUser?.role === role;
  }

  // Check if user is admin
  isAdmin(): boolean {
    return this.hasRole('admin');
  }
}
