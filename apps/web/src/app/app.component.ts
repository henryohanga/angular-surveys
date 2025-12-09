import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'angular-surveys';
  isHome = true;

  constructor(private router: Router) {
    this.isHome = this.router.url === '/' || this.router.url === '';
    this.router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
        this.isHome = e.urlAfterRedirects === '/' || e.urlAfterRedirects === '';
      }
    });
  }
}
