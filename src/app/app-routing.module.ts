import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SurveyComponent } from './surveys/survey.component';
import { MaterialSurveyComponent } from './surveys/material-survey.component';
import { BuilderComponent } from './builder/builder.component';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PublicSurveyComponent } from './public-survey/public-survey.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'builder', component: BuilderComponent },
  { path: 'builder/:id', component: BuilderComponent },
  { path: 'surveys', component: SurveyComponent },
  { path: 'surveys/material', component: MaterialSurveyComponent },
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
