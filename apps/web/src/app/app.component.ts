import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService, User } from './core/services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'angular-surveys';
  isHome = true;
  isAuthenticated$: Observable<boolean>;
  currentUser$: Observable<User | null>;

  constructor(private router: Router, private authService: AuthService) {
    this.isHome = this.router.url === '/' || this.router.url === '';
    this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        this.isHome = e.urlAfterRedirects === '/' || e.urlAfterRedirects === '';
      }
    });

    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.currentUser$ = this.authService.currentUser$;
  }

  logout(): void {
    this.authService.logout();
  }
}
