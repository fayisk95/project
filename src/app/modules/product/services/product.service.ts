import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { DueService } from './due.service';

export interface Product {
  id: string;
  productId: string;
  name: string;
  clientId: string;
  clientName: string;
  paymentAmount: number;
  isRecurring: boolean;
  recurringFrequency?: 'monthly' | 'quarterly' | 'yearly';
  recurringStartDate?: Date;
  nextDueDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private products: Product[] = [
    {
      id: '1',
      productId: 'PRD-001',
      name: 'Website Hosting',
      clientId: '1',
      clientName: 'ABC Corporation',
      paymentAmount: 299.99,
      isRecurring: true,
      recurringFrequency: 'monthly',
      recurringStartDate: new Date('2024-01-01'),
      nextDueDate: new Date('2024-03-01'),
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: '2',
      productId: 'PRD-002',
      name: 'Custom Development',
      clientId: '2',
      clientName: 'XYZ Limited',
      paymentAmount: 5000.00,
      isRecurring: false,
      isActive: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    }
  ];

  private productsSubject = new BehaviorSubject<Product[]>(this.products);

  constructor(private dueService: DueService) {
    // Initialize recurring dues for existing products
    this.initializeRecurringDues();
  }

  getAllProducts(): Observable<Product[]> {
    return this.productsSubject.asObservable();
  }

  getProductById(id: string): Observable<Product | undefined> {
    const product = this.products.find(p => p.id === id);
    return of(product);
  }

  getProductsByClientId(clientId: string): Observable<Product[]> {
    return this.getAllProducts().pipe(
      map(products => products.filter(p => p.clientId === clientId))
    );
  }

  createProduct(product: Omit<Product, 'id' | 'productId' | 'createdAt' | 'updatedAt' | 'nextDueDate'>): Observable<Product> {
    const newProduct: Product = {
      ...product,
      id: this.generateId(),
      productId: this.generateProductId(),
      nextDueDate: product.isRecurring ? this.calculateNextDueDate(product.recurringStartDate!, product.recurringFrequency!) : undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.products.push(newProduct);
    this.productsSubject.next([...this.products]);

    // Generate initial due if recurring
    if (newProduct.isRecurring && newProduct.recurringStartDate) {
      this.dueService.generateRecurringDue(newProduct);
    }

    return of(newProduct);
  }

  updateProduct(id: string, updates: Partial<Product>): Observable<Product | null> {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) {
      return of(null);
    }

    const oldProduct = { ...this.products[index] };
    this.products[index] = {
      ...this.products[index],
      ...updates,
      updatedAt: new Date()
    };

    // Recalculate next due date if recurring settings changed
    if (this.products[index].isRecurring && this.products[index].recurringStartDate) {
      this.products[index].nextDueDate = this.calculateNextDueDate(
        this.products[index].recurringStartDate!,
        this.products[index].recurringFrequency!
      );
    }

    this.productsSubject.next([...this.products]);

    // Handle recurring due changes
    if (oldProduct.isRecurring !== this.products[index].isRecurring) {
      if (this.products[index].isRecurring) {
        this.dueService.generateRecurringDue(this.products[index]);
      } else {
        this.dueService.cancelRecurringDues(id);
      }
    }

    return of(this.products[index]);
  }

  deleteProduct(id: string): Observable<boolean> {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) {
      return of(false);
    }

    // Cancel any recurring dues
    this.dueService.cancelRecurringDues(id);

    this.products.splice(index, 1);
    this.productsSubject.next([...this.products]);
    return of(true);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private generateProductId(): string {
    const count = this.products.length + 1;
    return `PRD-${count.toString().padStart(3, '0')}`;
  }

  private calculateNextDueDate(startDate: Date, frequency: 'monthly' | 'quarterly' | 'yearly'): Date {
    const now = new Date();
    const start = new Date(startDate);
    let nextDue = new Date(start);

    while (nextDue <= now) {
      switch (frequency) {
        case 'monthly':
          nextDue.setMonth(nextDue.getMonth() + 1);
          break;
        case 'quarterly':
          nextDue.setMonth(nextDue.getMonth() + 3);
          break;
        case 'yearly':
          nextDue.setFullYear(nextDue.getFullYear() + 1);
          break;
      }
    }

    return nextDue;
  }

  private initializeRecurringDues(): void {
    // Initialize recurring dues for existing products
    this.products.forEach(product => {
      if (product.isRecurring && product.recurringStartDate) {
        this.dueService.generateRecurringDue(product);
      }
    });
  }

  // Method to process recurring payments (would be called by a scheduler)
  processRecurringPayments(): void {
    const today = new Date();
    
    this.products.forEach(product => {
      if (product.isRecurring && product.nextDueDate && product.nextDueDate <= today) {
        // Generate new due
        this.dueService.generateRecurringDue(product);
        
        // Update next due date
        product.nextDueDate = this.calculateNextDueDate(
          product.nextDueDate,
          product.recurringFrequency!
        );
        product.updatedAt = new Date();
      }
    });

    this.productsSubject.next([...this.products]);
  }
}