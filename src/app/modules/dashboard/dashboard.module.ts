import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { DashboardComponent } from './dashboard.component';
import { KpiCardComponent } from './components/kpi-card/kpi-card.component';
import { ChartComponent } from './components/chart/chart.component';
import { RecentActivityComponent } from './components/recent-activity/recent-activity.component';
import { QuickActionsComponent } from './components/quick-actions/quick-actions.component';

const routes = [
  {
    path: '',
    component: DashboardComponent
  }
];

@NgModule({
  declarations: [
    DashboardComponent,
    KpiCardComponent,
    ChartComponent,
    RecentActivityComponent,
    QuickActionsComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class DashboardModule { }