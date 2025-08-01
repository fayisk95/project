import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { DueListComponent } from './due-list/due-list.component';
import { DueDetailComponent } from './due-detail/due-detail.component';
import { DueOverviewComponent } from './due-overview/due-overview.component';

const routes = [
  {
    path: '',
    component: DueOverviewComponent
  },
  {
    path: 'list',
    component: DueListComponent
  },
  {
    path: ':id',
    component: DueDetailComponent
  }
];

@NgModule({
  declarations: [
    DueListComponent,
    DueDetailComponent,
    DueOverviewComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class DueModule { }