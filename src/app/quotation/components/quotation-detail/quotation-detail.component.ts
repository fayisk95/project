import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { QuotationService, Quotation } from '../../services/quotation.service';

@Component({
  selector: 'app-quotation-detail',
  templateUrl: './quotation-detail.component.html',
  styleUrls: ['./quotation-detail.component.css']
})
export class QuotationDetailComponent implements OnInit {
  quotation: Quotation | null = null;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quotationService: QuotationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadQuotation(+id);
    }
  }

  loadQuotation(id: number) {
    this.isLoading = true;
    this.quotationService.getQuotationById(id).subscribe({
      next: (quotation) => {
        this.quotation = quotation;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading quotation:', error);
        this.isLoading = false;
        this.snackBar.open('Error loading quotation', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  editQuotation() {
    if (this.quotation?.id) {
      this.router.navigate(['/quotations', this.quotation.id, 'edit']);
    }
  }

  approveQuotation() {
    if (this.quotation?.id) {
      this.quotationService.approveQuotation(this.quotation.id).subscribe({
        next: (updatedQuotation) => {
          this.quotation = updatedQuotation;
          this.snackBar.open('Quotation approved successfully! BRD will be generated.', 'Close', {
            duration: 5000,
            panelClass: ['success-snackbar']
          });
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

  exportPdf() {
    if (this.quotation?.id) {
      this.quotationService.exportToPdf(this.quotation.id).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `quotation-${this.quotation?.projectTitle}.pdf`;
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

  getModulesTotal(): number {
    if (!this.quotation?.modules) return 0;
    return this.quotation.modules.reduce((total, module) => total + module.cost, 0);
  }

  getChargesTotal(): number {
    if (!this.quotation?.additionalCharges) return 0;
    return this.quotation.additionalCharges.reduce((total, charge) => total + charge.total, 0);
  }

  getSubtotal(): number {
    return this.getModulesTotal() + this.getChargesTotal();
  }

  getDiscountAmount(): number {
    const subtotal = this.getSubtotal();
    if (!this.quotation) return 0;
    
    if (this.quotation.discountType === 'percentage') {
      return (subtotal * this.quotation.discountValue) / 100;
    }
    return this.quotation.discountValue;
  }

  getTaxAmount(): number {
    if (!this.quotation) return 0;
    const afterDiscount = this.getSubtotal() - this.getDiscountAmount();
    return (afterDiscount * this.quotation.taxPercent) / 100;
  }

  backToList() {
    this.router.navigate(['/quotations']);
  }
}