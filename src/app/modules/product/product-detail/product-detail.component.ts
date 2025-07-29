import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Product, ProductService } from '../services/product.service';
import { Due, DueService } from '../services/due.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  product?: Product;
  dues$!: Observable<Due[]>;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private dueService: DueService
  ) {}

  ngOnInit() {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.loadProduct(productId);
      this.loadDues(productId);
    } else {
      this.router.navigate(['/products']);
    }
  }

  loadProduct(id: string) {
    this.productService.getProductById(id).subscribe(product => {
      this.isLoading = false;
      if (product) {
        this.product = product;
      } else {
        this.router.navigate(['/products']);
      }
    });
  }

  loadDues(productId: string) {
    this.dues$ = this.dueService.getDuesByProductId(productId);
  }

  onEdit() {
    if (this.product) {
      this.router.navigate(['/products/edit', this.product.id]);
    }
  }

  onBack() {
    this.router.navigate(['/products']);
  }

  formatCurrency(amount: number): string {
    return `$${amount.toLocaleString()}`;
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  }

  getRecurringText(): string {
    if (!this.product?.isRecurring) return 'No';
    return `Yes - ${this.product.recurringFrequency}`;
  }

  getStatusClass(): string {
    if (!this.product?.isActive) return 'inactive';
    if (this.product.isRecurring && this.product.nextDueDate) {
      const today = new Date();
      const dueDate = new Date(this.product.nextDueDate);
      if (dueDate <= today) return 'overdue';
      
      const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff <= 7) return 'due-soon';
    }
    return 'active';
  }

  getDueStatusClass(due: Due): string {
    switch (due.status) {
      case 'paid': return 'paid';
      case 'expired': return 'expired';
      case 'cancelled': return 'cancelled';
      default: return 'pending';
    }
  }

  markDueAsPaid(due: Due) {
    if (due.status === 'pending') {
      this.dueService.markDueAsPaid(due.id).subscribe(updatedDue => {
        if (updatedDue) {
          this.loadDues(this.product!.id);
        }
      });
    }
  }
}