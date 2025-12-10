import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Material imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AnalyticsDashboardComponent } from './analytics-dashboard/analytics-dashboard.component';
import { ResponseChartComponent } from './response-chart/response-chart.component';
import { ResponseTableComponent } from './response-table/response-table.component';
import { StatCardComponent } from './stat-card/stat-card.component';

@NgModule({
  declarations: [
    AnalyticsDashboardComponent,
    ResponseChartComponent,
    ResponseTableComponent,
    StatCardComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatTabsModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  exports: [
    AnalyticsDashboardComponent,
    ResponseChartComponent,
    ResponseTableComponent,
    StatCardComponent,
  ],
})
export class AnalyticsModule {}
