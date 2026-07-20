import { TestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Component } from '@angular/core';
import { IAuthService, ICapabilityService, CurrentUser } from '@angular-surveys/shared-types';
import {
  AUTH_SERVICE,
  WORKSPACE_SERVICE,
  CAPABILITY_SERVICE,
  AUTH_ROUTES,
  DEFAULT_AUTH_ROUTES,
} from './tokens';
import { AuthGuard, GuestGuard } from './guards/auth.guard';
import { IfCapableDirective } from './directives/if-capable.directive';
import { NullCapabilityService } from './services/null-capability.service';
import { NullWorkspaceService } from './services/null-workspace.service';

class MockAuthService implements IAuthService {
  private _auth$ = new BehaviorSubject<boolean>(false);
  private _user$ = new BehaviorSubject<CurrentUser | null>(null);

  get currentUser$(): Observable<CurrentUser | null> { return this._user$.asObservable(); }
  get isAuthenticated$(): Observable<boolean> { return this._auth$.asObservable(); }
  get token(): string | null { return null; }
  get currentUser(): CurrentUser | null { return this._user$.value; }
  get isAuthenticated(): boolean { return this._auth$.value; }

  login(_c: { email: string; password: string }): Observable<unknown> { return of({}); }
  logout(): void { this._auth$.next(false); this._user$.next(null); }
  refreshProfile(): Observable<CurrentUser | null> { return of(null); }

  setAuthenticated(user: CurrentUser): void {
    this._user$.next(user);
    this._auth$.next(true);
  }
}

class AlwaysCapableService implements ICapabilityService {
  isCapable(_cap: string): Observable<boolean> { return of(true); }
  isCapableSync(_cap: string): boolean { return true; }
}

@Component({ template: '<span *ifCapable="\'premium\'">premium content</span>', standalone: false })
class TestHostComponent {}

describe('Extension Seams', () => {
  describe('AUTH_SERVICE token swap', () => {
    let authService: MockAuthService;

    beforeEach(() => {
      authService = new MockAuthService();

      TestBed.configureTestingModule({
        imports: [RouterModule.forRoot([])],
        providers: [
          AuthGuard,
          GuestGuard,
          { provide: AUTH_SERVICE, useValue: authService },
          { provide: AUTH_ROUTES, useValue: DEFAULT_AUTH_ROUTES },
        ],
      });
    });

    it('AuthGuard allows authenticated user through', (done) => {
      const guard = TestBed.inject(AuthGuard);
      authService.setAuthenticated({ id: '1', email: 'a@b.com', name: 'A', role: 'user' });

      const result$ = guard.canActivate(
        { data: {} } as never,
        { url: '/dashboard' } as never
      ) as Observable<boolean>;

      result$.subscribe((val) => {
        expect(val).toBe(true);
        done();
      });
    });

    it('AuthGuard blocks unauthenticated user and redirects to login', (done) => {
      const guard = TestBed.inject(AuthGuard);
      const router = TestBed.inject(Router);

      const result$ = guard.canActivate(
        { data: {} } as never,
        { url: '/dashboard' } as never
      ) as Observable<boolean>;

      result$.subscribe((val) => {
        expect(val).not.toBe(true);
        const tree = router.createUrlTree([DEFAULT_AUTH_ROUTES.login]);
        expect((val as unknown as { toString(): string }).toString()).toContain(tree.root.toString());
        done();
      });
    });

    it('GuestGuard blocks authenticated user and redirects to dashboard', (done) => {
      const guard = TestBed.inject(GuestGuard);
      authService.setAuthenticated({ id: '1', email: 'a@b.com', name: 'A', role: 'user' });

      const result$ = guard.canActivate() as Observable<boolean>;
      result$.subscribe((val) => {
        expect(val).not.toBe(true);
        done();
      });
    });

    it('AUTH_ROUTES override changes redirect target', (done) => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [RouterModule.forRoot([])],
        providers: [
          AuthGuard,
          GuestGuard,
          { provide: AUTH_SERVICE, useValue: authService },
          { provide: AUTH_ROUTES, useValue: { login: '/signin', register: '/signup', dashboard: '/home' } },
        ],
      });

      const guard = TestBed.inject(GuestGuard);
      authService.setAuthenticated({ id: '1', email: 'a@b.com', name: 'A', role: 'user' });

      (guard.canActivate() as Observable<boolean>).subscribe((val) => {
        const str = (val as unknown as { toString(): string }).toString();
        expect(str).toContain('home');
        done();
      });
    });
  });

  describe('CAPABILITY_SERVICE token swap', () => {
    it('NullCapabilityService returns false for all capabilities', () => {
      const svc = new NullCapabilityService();
      expect(svc.isCapableSync('any-capability')).toBe(false);
    });

    it('NullCapabilityService.isCapable() emits false', (done) => {
      const svc = new NullCapabilityService();
      svc.isCapable('premium').subscribe((val) => {
        expect(val).toBe(false);
        done();
      });
    });

    it('Custom capability service can enable capabilities', () => {
      const svc = new AlwaysCapableService();
      expect(svc.isCapableSync('premium')).toBe(true);
    });
  });

  describe('WORKSPACE_SERVICE', () => {
    it('NullWorkspaceService returns null workspaceId', () => {
      const svc = new NullWorkspaceService();
      expect(svc.workspaceId).toBeNull();
    });

    it('NullWorkspaceService.workspaceId$ emits null', (done) => {
      const svc = new NullWorkspaceService();
      svc.workspaceId$.subscribe((id) => {
        expect(id).toBeNull();
        done();
      });
    });
  });

  describe('*ifCapable directive', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [TestHostComponent, IfCapableDirective],
        providers: [
          { provide: CAPABILITY_SERVICE, useClass: NullCapabilityService },
        ],
      });
    });

    it('hides content when capability is false (NullCapabilityService)', async () => {
      const fixture = TestBed.createComponent(TestHostComponent);
      fixture.detectChanges();
      await fixture.whenStable();
      const el: HTMLElement = fixture.nativeElement;
      expect(el.querySelector('span')).toBeNull();
    });

    it('shows content when replaced with AlwaysCapableService', async () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        declarations: [TestHostComponent, IfCapableDirective],
        providers: [
          { provide: CAPABILITY_SERVICE, useClass: AlwaysCapableService },
        ],
      });

      const fixture = TestBed.createComponent(TestHostComponent);
      fixture.detectChanges();
      await fixture.whenStable();
      const el: HTMLElement = fixture.nativeElement;
      expect(el.querySelector('span')).not.toBeNull();
      expect(el.querySelector('span')?.textContent).toBe('premium content');
    });
  });
});
