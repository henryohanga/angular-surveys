import { Injectable, inject } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AUTH_SERVICE, AUTH_ROUTES, DEFAULT_AUTH_ROUTES } from '../tokens';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private readonly authService = inject(AUTH_SERVICE);
  private readonly router = inject(Router);
  private readonly routes = inject(AUTH_ROUTES, { optional: true }) ?? DEFAULT_AUTH_ROUTES;

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.authService.isAuthenticated$.pipe(
      take(1),
      map((isAuthenticated) => {
        if (isAuthenticated) {
          const requiredRoles = route.data['roles'] as string[] | undefined;
          if (requiredRoles && requiredRoles.length > 0) {
            const userRole = this.authService.currentUser?.role;
            if (!userRole || !requiredRoles.includes(userRole)) {
              return this.router.createUrlTree(['/']);
            }
          }
          return true;
        }

        return this.router.createUrlTree([this.routes.login], {
          queryParams: { returnUrl: state.url },
        });
      })
    );
  }
}

@Injectable({
  providedIn: 'root',
})
export class GuestGuard implements CanActivate {
  private readonly authService = inject(AUTH_SERVICE);
  private readonly router = inject(Router);
  private readonly routes = inject(AUTH_ROUTES, { optional: true }) ?? DEFAULT_AUTH_ROUTES;

  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.isAuthenticated$.pipe(
      take(1),
      map((isAuthenticated) => {
        if (isAuthenticated) {
          return this.router.createUrlTree([this.routes.dashboard]);
        }
        return true;
      })
    );
  }
}
