import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { ClientStatementComponent } from './client-statement/client-statement.component';
import { StatementPdfService } from './services/statement-pdf.service';

const routes = [
  {
    path: ':clientId',
    component: ClientStatementComponent
  }
];

@NgModule({
  declarations: [
    ClientStatementComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  providers: [
    StatementPdfService
  ]
})
export class ClientStatementModule { }