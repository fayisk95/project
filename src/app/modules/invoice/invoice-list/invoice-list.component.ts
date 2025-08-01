import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Invoice, InvoiceService } from '../services/invoice.service';
import { PdfService } from '../services/pdf.service';

@Component({
  selector: 'app-invoice-list',
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.scss']
})
export class InvoiceListComponent implements OnInit {
  invoices: Invoice[] = [];
  filteredInvoices: Invoice[] = [];
  displayedColumns: string[] = ['invoiceId', 'clientName', 'total', 'status', 'issueDate', 'dueDate', 'actions'];
  searchTerm = '';
  statusFilter = 'all';

  statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'paid', label: 'Paid' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  constructor(
    private invoiceService: InvoiceService,
    private pdfService: PdfService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadInvoices();
  }

  loadInvoices() {
    this.invoiceService.getAllInvoices().subscribe(invoices => {
      this.invoices = invoices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      this.applyFilters();
    });
  }

  applyFilters() {
    let filtered = [...this.invoices];

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(invoice =>
        invoice.invoiceId.toLowerCase().includes(term) ||
        invoice.clientName.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === this.statusFilter);
    }

    this.filteredInvoices = filtered;
  }

  onSearchChange() {
    this.applyFilters();
  }

  onStatusFilterChange() {
    this.applyFilters();
  }

  onCreateInvoice() {
    this.router.navigate(['/invoices/create']);
  }

  onViewInvoice(invoice: Invoice) {
    this.router.navigate(['/invoices', invoice.id]);
  }

  onDownloadPDF(invoice: Invoice, event: Event) {
    event.stopPropagation();
    this.pdfService.generateInvoicePDF(invoice).catch(error => {
      this.snackBar.open('Failed to generate PDF: ' + error.message, 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    });
  }

  onMarkAsPaid(invoice: Invoice, event: Event) {
    event.stopPropagation();
    if (invoice.status !== 'paid') {
      this.invoiceService.updateInvoiceStatus(invoice.id, 'paid', new Date()).subscribe(updatedInvoice => {
        if (updatedInvoice) {
          this.snackBar.open('Invoice marked as paid', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadInvoices();
        }
      });
    }
  }

  onDeleteInvoice(invoice: Invoice, event: Event) {
    event.stopPropagation();
    if (confirm(`Are you sure you want to delete invoice ${invoice.invoiceId}?`)) {
      this.invoiceService.deleteInvoice(invoice.id).subscribe(success => {
        if (success) {
          this.snackBar.open('Invoice deleted successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadInvoices();
        }
      });
    }
  }

  formatCurrency(amount: number): string {
    return `$${amount.toLocaleString()}`;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'paid': return 'paid';
      case 'sent': return 'sent';
      case 'overdue': return 'overdue';
      case 'cancelled': return 'cancelled';
      default: return 'draft';
    }
  }

  getStatusText(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }
}