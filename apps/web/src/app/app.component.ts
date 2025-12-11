import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService, User } from './core/services/auth.service';
import { Observable, Subject, takeUntil } from 'rxjs';

@Component({ standalone: false,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly destroy$ = new Subject<void>();

  protected readonly title = 'angular-surveys';
  protected isHome = true;
  protected readonly isAuthenticated$: Observable<boolean>;
  protected readonly currentUser$: Observable<User | null>;

  constructor() {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    this.isHome = this.router.url === '/' || this.router.url === '';
    this.router.events
      .pipe(takeUntil(this.destroy$))
      .subscribe((e) => {
        if (e instanceof NavigationEnd) {
          this.isHome = e.urlAfterRedirects === '/' || e.urlAfterRedirects === '';
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected logout(): void {
    this.authService.logout();
  }
}
