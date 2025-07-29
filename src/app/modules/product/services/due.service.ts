import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { Product } from './product.service';

export interface Due {
  id: string;
  dueId: string;
  productId: string;
  productName: string;
  clientId: string;
  clientName: string;
  amount: number;
  dueDate: Date;
  expiryDate: Date;
  status: 'pending' | 'paid' | 'expired' | 'cancelled';
  isRecurring: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class DueService {
  private dues: Due[] = [
    {
      id: '1',
      dueId: 'DUE-001',
      productId: '1',
      productName: 'Website Hosting',
      clientId: '1',
      clientName: 'ABC Corporation',
      amount: 299.99,
      dueDate: new Date('2024-03-01'),
      expiryDate: new Date('2024-03-31'),
      status: 'pending',
      isRecurring: true,
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-01')
    }
  ];

  private duesSubject = new BehaviorSubject<Due[]>(this.dues);

  constructor() {
    // Check for expired dues on initialization
    this.checkExpiredDues();
    
    // Set up periodic check for expired dues (every hour)
    setInterval(() => {
      this.checkExpiredDues();
    }, 60 * 60 * 1000);
  }

  getAllDues(): Observable<Due[]> {
    return this.duesSubject.asObservable();
  }

  getDueById(id: string): Observable<Due | undefined> {
    const due = this.dues.find(d => d.id === id);
    return of(due);
  }

  getDuesByProductId(productId: string): Observable<Due[]> {
    const productDues = this.dues.filter(d => d.productId === productId);
    return of(productDues);
  }

  getDuesByClientId(clientId: string): Observable<Due[]> {
    const clientDues = this.dues.filter(d => d.clientId === clientId);
    return of(clientDues);
  }

  getPendingDues(): Observable<Due[]> {
    const pendingDues = this.dues.filter(d => d.status === 'pending');
    return of(pendingDues);
  }

  getExpiredDues(): Observable<Due[]> {
    const expiredDues = this.dues.filter(d => d.status === 'expired');
    return of(expiredDues);
  }

  generateRecurringDue(product: Product): Observable<Due> {
    const dueDate = product.nextDueDate || new Date();
    const expiryDate = new Date(dueDate);
    expiryDate.setDate(expiryDate.getDate() + 30); // 30 days to pay

    const newDue: Due = {
      id: this.generateId(),
      dueId: this.generateDueId(),
      productId: product.id,
      productName: product.name,
      clientId: product.clientId,
      clientName: product.clientName,
      amount: product.paymentAmount,
      dueDate,
      expiryDate,
      status: 'pending',
      isRecurring: product.isRecurring,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.dues.push(newDue);
    this.duesSubject.next([...this.dues]);

    return of(newDue);
  }

  markDueAsPaid(dueId: string): Observable<Due | null> {
    const index = this.dues.findIndex(d => d.id === dueId);
    if (index === -1) {
      return of(null);
    }

    this.dues[index].status = 'paid';
    this.dues[index].updatedAt = new Date();

    this.duesSubject.next([...this.dues]);
    return of(this.dues[index]);
  }

  cancelRecurringDues(productId: string): Observable<boolean> {
    let updated = false;
    
    this.dues.forEach(due => {
      if (due.productId === productId && due.status === 'pending') {
        due.status = 'cancelled';
        due.updatedAt = new Date();
        updated = true;
      }
    });

    if (updated) {
      this.duesSubject.next([...this.dues]);
    }

    return of(updated);
  }

  private checkExpiredDues(): void {
    const now = new Date();
    let updated = false;

    this.dues.forEach(due => {
      if (due.status === 'pending' && due.expiryDate < now) {
        due.status = 'expired';
        due.updatedAt = new Date();
        updated = true;
      }
    });

    if (updated) {
      this.duesSubject.next([...this.dues]);
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private generateDueId(): string {
    const count = this.dues.length + 1;
    return `DUE-${count.toString().padStart(3, '0')}`;
  }

  // Get summary statistics
  getDueSummary(): Observable<{
    totalPending: number;
    totalExpired: number;
    totalAmount: number;
    expiredAmount: number;
  }> {
    const pending = this.dues.filter(d => d.status === 'pending');
    const expired = this.dues.filter(d => d.status === 'expired');
    
    const summary = {
      totalPending: pending.length,
      totalExpired: expired.length,
      totalAmount: pending.reduce((sum, due) => sum + due.amount, 0),
      expiredAmount: expired.reduce((sum, due) => sum + due.amount, 0)
    };

    return of(summary);
  }
}