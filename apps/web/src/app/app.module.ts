import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { SurveysModule } from './surveys/surveys.module';
import { HomeModule } from './home/home.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PublicSurveyModule } from './public-survey/public-survey.module';
import { AuthModule } from './auth/auth.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { GlobalErrorHandler } from './core/error-handler';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { LocalAuthService } from './core/services/auth.service';
import { NullWorkspaceService } from './core/services/null-workspace.service';
import { NullCapabilityService } from './core/services/null-capability.service';
import { IfCapableDirective } from './core/directives/if-capable.directive';
import {
  AUTH_SERVICE,
  WORKSPACE_SERVICE,
  CAPABILITY_SERVICE,
  AUTH_ROUTES,
  DEFAULT_AUTH_ROUTES,
  QUESTION_TYPE_REGISTRY,
  UI_EXTENSIONS,
} from './core/tokens';

@NgModule({
  declarations: [AppComponent, IfCapableDirective],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    SurveysModule,
    HomeModule,
    DashboardModule,
    PublicSurveyModule,
    AuthModule,
    AnalyticsModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
  ],
  providers: [
    provideAnimationsAsync(),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: AUTH_SERVICE, useClass: LocalAuthService },
    { provide: WORKSPACE_SERVICE, useClass: NullWorkspaceService },
    { provide: CAPABILITY_SERVICE, useClass: NullCapabilityService },
    { provide: AUTH_ROUTES, useValue: DEFAULT_AUTH_ROUTES },
    { provide: QUESTION_TYPE_REGISTRY, useValue: [] },
    { provide: UI_EXTENSIONS, useValue: [] },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
