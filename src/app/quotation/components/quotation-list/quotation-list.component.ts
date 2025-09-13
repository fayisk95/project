import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { QuotationService, Quotation } from '../../services/quotation.service';

@Component({
  selector: 'app-quotation-list',
  templateUrl: './quotation-list.component.html',
  styleUrls: ['./quotation-list.component.css']
})
export class QuotationListComponent implements OnInit {
  quotations: Quotation[] = [];
  displayedColumns: string[] = ['projectTitle', 'clientCompany', 'status', 'grandTotal', 'createdAt', 'actions'];
  isLoading = false;

  constructor(
    private quotationService: QuotationService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadQuotations();
  }

  loadQuotations() {
    this.isLoading = true;
    this.quotationService.getAllQuotations().subscribe({
      next: (quotations) => {
        this.quotations = quotations;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading quotations:', error);
        this.isLoading = false;
        this.snackBar.open('Error loading quotations', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  createNew() {
    this.router.navigate(['/quotations/new']);
  }

  viewQuotation(id: number) {
    this.router.navigate(['/quotations', id]);
  }

  editQuotation(id: number) {
    this.router.navigate(['/quotations', id, 'edit']);
  }

  approveQuotation(quotation: Quotation) {
    if (quotation.id) {
      this.quotationService.approveQuotation(quotation.id).subscribe({
        next: (updatedQuotation) => {
          this.snackBar.open('Quotation approved successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadQuotations();
        },
        error: (error) => {
          console.error('Error approving quotation:', error);
          this.snackBar.open('Error approving quotation', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  exportPdf(quotation: Quotation) {
    if (quotation.id) {
      this.quotationService.exportToPdf(quotation.id).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `quotation-${quotation.projectTitle}.pdf`;
          link.click();
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          console.error('Error exporting PDF:', error);
          this.snackBar.open('Error exporting PDF', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  deleteQuotation(quotation: Quotation) {
    if (confirm('Are you sure you want to delete this quotation?') && quotation.id) {
      this.quotationService.deleteQuotation(quotation.id).subscribe({
        next: () => {
          this.snackBar.open('Quotation deleted successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadQuotations();
        },
        error: (error) => {
          console.error('Error deleting quotation:', error);
          this.snackBar.open('Error deleting quotation', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'approved': return 'success';
      case 'draft': return 'warn';
      default: return 'primary';
    }
  }
}