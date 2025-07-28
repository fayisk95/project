import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ClientListComponent } from './client-list/client-list.component';
import { ClientFormComponent } from './client-form/client-form.component';
import { ClientDetailComponent } from './client-detail/client-detail.component';
import { ClientService } from './services/client.service';

import { ReactiveFormsModule,FormsModule } from '@angular/forms';
const routes = [
  {
    path: '',
    component: ClientListComponent
  },
  {
    path: 'add',
    component: ClientFormComponent
  },
  {
    path: 'edit/:id',
    component: ClientFormComponent
  },
  {
    path: ':id',
    component: ClientDetailComponent
  }
];

@NgModule({
  declarations: [
    ClientListComponent,
    ClientFormComponent,
    ClientDetailComponent
  ],
  imports: [
    FormsModule,ReactiveFormsModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  providers: [
    ClientService
  ]
})
export class ClientModule { }