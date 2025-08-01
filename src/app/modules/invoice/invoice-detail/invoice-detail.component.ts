import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { Invoice, InvoiceService, Payment } from '../services/invoice.service';
import { PaymentService } from '../services/payment.service';
import { PdfService } from '../services/pdf.service';

@Component({
  selector: 'app-invoice-detail',
  templateUrl: './invoice-detail.component.html',
  styleUrls: ['./invoice-detail.component.scss']
})
export class InvoiceDetailComponent implements OnInit {
  invoice?: Invoice;
  payments$!: Observable<Payment[]>;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private invoiceService: InvoiceService,
    private paymentService: PaymentService,
    private pdfService: PdfService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    const invoiceId = this.route.snapshot.paramMap.get('id');
    if (invoiceId) {
      this.loadInvoice(invoiceId);
      this.loadPayments(invoiceId);
    } else {
      this.router.navigate(['/invoices']);
    }
  }

  loadInvoice(id: string) {
    this.invoiceService.getInvoiceById(id).subscribe(invoice => {
      this.isLoading = false;
      if (invoice) {
        this.invoice = invoice;
      } else {
        this.router.navigate(['/invoices']);
      }
    });
  }

  loadPayments(invoiceId: string) {
    this.payments$ = this.paymentService.getPaymentsByInvoiceId(invoiceId);
  }

  onBack() {
    this.router.navigate(['/invoices']);
  }

  onDownloadPDF() {
    if (this.invoice) {
      this.pdfService.generateInvoicePDF(this.invoice).catch(error => {
        this.snackBar.open('Failed to generate PDF: ' + error.message, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      });
    }
  }

  onMarkAsPaid() {
    if (this.invoice && this.invoice.status !== 'paid') {
      this.invoiceService.updateInvoiceStatus(this.invoice.id, 'paid', new Date()).subscribe(updatedInvoice => {
        if (updatedInvoice) {
          this.invoice = updatedInvoice;
          this.snackBar.open('Invoice marked as paid', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        }
      });
    }
  }

  onViewPaymentHistory() {
    if (this.invoice) {
      this.router.navigate(['/invoices/payment-history', this.invoice.clientId]);
    }
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

  getStatusClass(): string {
    if (!this.invoice) return '';

    switch (this.invoice.status) {
      case 'paid': return 'paid';
      case 'sent': return 'sent';
      case 'overdue': return 'overdue';
      case 'cancelled': return 'cancelled';
      default: return 'draft';
    }
  }

  getStatusText(): string {
    if (!this.invoice) return '';
    return this.invoice.status.charAt(0).toUpperCase() + this.invoice.status.slice(1);
  }

  getPaymentMethodText(method: string): string {
    switch (method) {
      case 'bank_transfer': return 'Bank Transfer';
      case 'credit_card': return 'Credit Card';
      default: return method.charAt(0).toUpperCase() + method.slice(1);
    }
  }
}