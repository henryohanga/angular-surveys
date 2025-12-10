import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SurveyComponent } from './surveys/survey.component';
import { BuilderComponent } from './builder/builder.component';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PublicSurveyComponent } from './public-survey/public-survey.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { AnalyticsDashboardComponent } from './analytics/analytics-dashboard/analytics-dashboard.component';
import { AuthGuard, GuestGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { path: '', component: HomeComponent },

  // Auth routes (guests only)
  { path: 'login', component: LoginComponent, canActivate: [GuestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [GuestGuard] },

  // Protected routes (authenticated users)
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  // Builder requires a survey ID - redirect bare /builder to dashboard
  { path: 'builder', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'builder/:id',
    component: BuilderComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'responses/:id',
    component: AnalyticsDashboardComponent,
    canActivate: [AuthGuard],
  },

  // Demo route - shows sample survey for trying out
  { path: 'demo', component: SurveyComponent },

  // Public survey routes
  { path: 'preview/:id', component: PublicSurveyComponent },
  { path: 's/:id', component: PublicSurveyComponent }, // Short URL for sharing

  // Redirect old routes
  { path: 'surveys', redirectTo: 'demo', pathMatch: 'full' },
  { path: 'surveys/material', redirectTo: 'demo', pathMatch: 'full' },
  { path: 'analytics/:id', redirectTo: 'responses/:id', pathMatch: 'full' },
  { path: 'analytics', redirectTo: 'dashboard', pathMatch: 'full' },

  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
