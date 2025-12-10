import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SurveyComponent } from './surveys/survey.component';
import { MaterialSurveyComponent } from './surveys/material-survey.component';
import { BuilderComponent } from './builder/builder.component';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PublicSurveyComponent } from './public-survey/public-survey.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
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
  { path: 'builder', component: BuilderComponent, canActivate: [AuthGuard] },
  {
    path: 'builder/:id',
    component: BuilderComponent,
    canActivate: [AuthGuard],
  },

  // Demo routes (no auth required for now)
  { path: 'surveys', component: SurveyComponent },
  { path: 'surveys/material', component: MaterialSurveyComponent },

  // Public survey routes
  { path: 'preview/:id', component: PublicSurveyComponent },
  { path: 's/:id', component: PublicSurveyComponent }, // Short URL for sharing

  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
