import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SurveyComponent } from './surveys/survey.component';
import { MaterialSurveyComponent } from './surveys/material-survey.component';
import { BuilderComponent } from './builder/builder.component';


const routes: Routes = [
  { path: 'surveys', component: SurveyComponent },
  { path: 'surveys/material', component: MaterialSurveyComponent },
  { path: 'builder', component: BuilderComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
