import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Product, ProductService } from '../services/product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  displayedColumns: string[] = ['productId', 'name', 'clientName', 'paymentAmount', 'isRecurring', 'nextDueDate', 'actions'];
  searchTerm = '';

  constructor(
    private productService: ProductService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getAllProducts().subscribe(products => {
      this.products = products;
    });
  }

  get filteredProducts() {
    if (!this.searchTerm) {
      return this.products;
    }

    const term = this.searchTerm.toLowerCase();
    return this.products.filter(product =>
      product.name.toLowerCase().includes(term) ||
      product.clientName.toLowerCase().includes(term) ||
      product.productId.toLowerCase().includes(term)
    );
  }

  onAddProduct() {
    this.router.navigate(['/products/add']);
  }

  onEditProduct(product: Product) {
    this.router.navigate(['/products/edit', product.id]);
  }

  onViewProduct(product: Product) {
    this.router.navigate(['/products', product.id]);
  }

  onDeleteProduct(product: Product) {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      this.productService.deleteProduct(product.id).subscribe(success => {
        if (success) {
          this.snackBar.open('Product deleted successfully', 'Close', {
            duration: 3000
          });
          this.loadProducts();
        }
      });
    }
  }

  formatCurrency(amount: number): string {
    return `$${amount.toLocaleString()}`;
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  }

  getRecurringText(product: Product): string {
    if (!product.isRecurring) return 'No';
    return `Yes (${product.recurringFrequency})`;
  }

  getStatusClass(product: Product): string {
    if (!product.isActive) return 'inactive';
    if (product.isRecurring && product.nextDueDate) {
      const today = new Date();
      const dueDate = new Date(product.nextDueDate);
      if (dueDate <= today) return 'overdue';
      
      const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff <= 7) return 'due-soon';
    }
    return 'active';
  }
}