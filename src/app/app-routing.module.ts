import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SurveyComponent } from './surveys/survey.component';


const routes: Routes = [
  { path: 'surveys', component: SurveyComponent },
  { path: 'surveys/material', component: SurveyComponent },
  { path: '', redirectTo: 'surveys', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
