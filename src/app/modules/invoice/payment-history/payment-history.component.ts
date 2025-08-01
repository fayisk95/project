import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Client, ClientService } from '../../client/services/client.service';
import { PaymentService } from '../services/payment.service';
import { Invoice, InvoiceService, Payment } from '../services/invoice.service';

@Component({
  selector: 'app-payment-history',
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.scss']
})
export class PaymentHistoryComponent implements OnInit {
  client?: Client;
  payments$!: Observable<Payment[]>;
  invoices$!: Observable<Invoice[]>;
  paymentStats$!: Observable<any>;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService,
    private paymentService: PaymentService,
    private invoiceService: InvoiceService
  ) { }

  ngOnInit() {
    const clientId = this.route.snapshot.paramMap.get('clientId');
    if (clientId) {
      this.loadClientData(clientId);
    } else {
      this.router.navigate(['/invoices']);
    }
  }

  loadClientData(clientId: string) {
    // Load client details
    this.clientService.getClientById(clientId).subscribe(client => {
      this.isLoading = false;
      if (client) {
        this.client = client;
      } else {
        this.router.navigate(['/invoices']);
        return;
      }
    });

    // Load payments
    this.payments$ = this.paymentService.getPaymentsByClientId(clientId);

    // Load invoices
    this.invoices$ = this.invoiceService.getInvoicesByClientId(clientId);

    // Load payment statistics
    this.paymentStats$ = this.paymentService.getClientPaymentStats(clientId);
  }

  onBack() {
    this.router.navigate(['/invoices']);
  }

  onViewInvoice(invoiceId: string) {
    this.router.navigate(['/invoices', invoiceId]);
  }

  formatCurrency(amount: number): string {
    return `$${amount.toLocaleString()}`;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  formatDateTime(date: Date): string {
    return new Date(date).toLocaleString();
  }

  getPaymentMethodText(method: string): string {
    switch (method) {
      case 'bank_transfer': return 'Bank Transfer';
      case 'credit_card': return 'Credit Card';
      default: return method.charAt(0).toUpperCase() + method.slice(1);
    }
  }

  getInvoiceStatusClass(status: string): string {
    switch (status) {
      case 'paid': return 'paid';
      case 'sent': return 'sent';
      case 'overdue': return 'overdue';
      case 'cancelled': return 'cancelled';
      default: return 'draft';
    }
  }

  getInvoiceStatusText(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }
}