import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Client, ClientService } from '../../client/services/client.service';
import { Product, ProductService } from '../../product/services/product.service';
import { Due, DueService } from '../../product/services/due.service';
import { PaymentService } from '../../invoice/services/payment.service';
import { StatementPdfService } from '../services/statement-pdf.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Payment } from '../../invoice/services/invoice.service';

export interface ClientStatement {
  client: Client;
  products: Product[];
  dues: Due[];
  payments: Payment[];
  summary: {
    totalOutstanding: number;
    totalPaid: number;
    totalDues: number;
    activeDues: number;
    paidDues: number;
    expiredDues: number;
  };
}

@Component({
  selector: 'app-client-statement',
  templateUrl: './client-statement.component.html',
  styleUrls: ['./client-statement.component.scss']
})
export class ClientStatementComponent implements OnInit {
  statement$!: Observable<ClientStatement>;
  isLoading = true;
  clientId!: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService,
    private productService: ProductService,
    private dueService: DueService,
    private paymentService: PaymentService,
    private statementPdfService: StatementPdfService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.clientId = this.route.snapshot.paramMap.get('clientId')!;
    if (!this.clientId) {
      this.router.navigate(['/clients']);
      return;
    }
    this.loadStatement();
  }

  loadStatement() {
    this.statement$ = combineLatest([
      this.clientService.getClientById(this.clientId),
      this.productService.getProductsByClientId(this.clientId),
      this.dueService.getDuesByClientId(this.clientId),
      this.paymentService.getPaymentsByClientId(this.clientId)
    ]).pipe(
      map(([client, products, dues, payments]) => {
        this.isLoading = false;

        if (!client) {
          this.router.navigate(['/clients']);
          throw new Error('Client not found');
        }

        const summary = this.calculateSummary(dues, payments);

        return {
          client,
          products,
          dues: dues.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
          payments: payments.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()),
          summary
        };
      })
    );
  }

  private calculateSummary(dues: Due[], payments: Payment[]) {
    const totalDues = dues.length;
    const activeDues = dues.filter(d => d.status === 'pending').length;
    const paidDues = dues.filter(d => d.status === 'paid').length;
    const expiredDues = dues.filter(d => d.status === 'expired').length;

    const totalOutstanding = dues
      .filter(d => d.status === 'pending' || d.status === 'expired')
      .reduce((sum, due) => sum + due.amount, 0);

    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);

    return {
      totalOutstanding,
      totalPaid,
      totalDues,
      activeDues,
      paidDues,
      expiredDues
    };
  }

  onBack() {
    this.router.navigate(['/clients']);
  }

  onDownloadPDF(statement: ClientStatement) {
    this.statementPdfService.generateStatementPDF(statement).catch(error => {
      this.snackBar.open('Failed to generate PDF: ' + error.message, 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    });
  }

  formatCurrency(amount: number): string {
    return `$${amount.toLocaleString()}`;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  getDueStatusClass(due: Due): string {
    const now = new Date();
    const dueDate = new Date(due.dueDate);
    const expiryDate = new Date(due.expiryDate);

    if (due.status === 'paid') return 'paid';
    if (due.status === 'expired' || expiryDate < now) return 'overdue';
    if (due.status === 'cancelled') return 'cancelled';

    if (dueDate <= now) return 'current';

    const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil <= 7) return 'upcoming';

    return 'future';
  }

  getDueStatusText(due: Due): string {
    const statusClass = this.getDueStatusClass(due);

    switch (statusClass) {
      case 'paid': return 'Paid';
      case 'overdue': return 'Overdue';
      case 'cancelled': return 'Cancelled';
      case 'current': return 'Due Now';
      case 'upcoming': return 'Upcoming';
      case 'future': return 'Future';
      default: return 'Unknown';
    }
  }

  getPaymentMethodText(method: string): string {
    switch (method) {
      case 'bank_transfer': return 'Bank Transfer';
      case 'credit_card': return 'Credit Card';
      default: return method.charAt(0).toUpperCase() + method.slice(1);
    }
  }
}