import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { InvoiceListComponent } from './invoice-list/invoice-list.component';
import { InvoiceFormComponent } from './invoice-form/invoice-form.component';
import { InvoiceDetailComponent } from './invoice-detail/invoice-detail.component';
import { PaymentHistoryComponent } from './payment-history/payment-history.component';
import { InvoiceService } from './services/invoice.service';
import { PaymentService } from './services/payment.service';
import { PdfService } from './services/pdf.service';

const routes = [
  {
    path: '',
    component: InvoiceListComponent
  },
  {
    path: 'create',
    component: InvoiceFormComponent
  },
  {
    path: 'create/:clientId',
    component: InvoiceFormComponent
  },
  {
    path: 'payment-history/:clientId',
    component: PaymentHistoryComponent
  },
  {
    path: ':id',
    component: InvoiceDetailComponent
  }
];

@NgModule({
  declarations: [
    InvoiceListComponent,
    InvoiceFormComponent,
    InvoiceDetailComponent,
    PaymentHistoryComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  providers: [
    InvoiceService,
    PaymentService,
    PdfService
  ]
})
export class InvoiceModule { }