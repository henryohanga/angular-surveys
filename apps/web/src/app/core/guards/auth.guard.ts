import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

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
          // Check for required roles
          const requiredRoles = route.data['roles'] as string[] | undefined;
          if (requiredRoles && requiredRoles.length > 0) {
            const userRole = this.authService.currentUser?.role;
            if (!userRole || !requiredRoles.includes(userRole)) {
              // User doesn't have required role
              return this.router.createUrlTree(['/']);
            }
          }
          return true;
        }

        // Not authenticated, redirect to login
        return this.router.createUrlTree(['/login'], {
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
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.isAuthenticated$.pipe(
      take(1),
      map((isAuthenticated) => {
        if (isAuthenticated) {
          // Already logged in, redirect to dashboard
          return this.router.createUrlTree(['/dashboard']);
        }
        return true;
      })
    );
  }
}
