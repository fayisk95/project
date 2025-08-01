import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { Due } from '../../product/services/due.service';

export interface InvoiceItem {
  dueId: string;
  productName: string;
  amount: number;
  dueDate: Date;
  description?: string;
}

export interface Invoice {
  id: string;
  invoiceId: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  taxRate: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issueDate: Date;
  dueDate: Date;
  paidDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  paymentId: string;
  invoiceId: string;
  clientId: string;
  amount: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'credit_card' | 'check' | 'other';
  paymentDate: Date;
  reference?: string;
  notes?: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private invoices: Invoice[] = [];
  private invoicesSubject = new BehaviorSubject<Invoice[]>(this.invoices);
  private invoiceCounter = 1;

  constructor() {
    // Initialize with sample data
    this.initializeSampleData();
  }

  getAllInvoices(): Observable<Invoice[]> {
    return this.invoicesSubject.asObservable();
  }

  getInvoiceById(id: string): Observable<Invoice | undefined> {
    const invoice = this.invoices.find(i => i.id === id);
    return of(invoice);
  }

  getInvoicesByClientId(clientId: string): Observable<Invoice[]> {
    const clientInvoices = this.invoices.filter(i => i.clientId === clientId);
    return of(clientInvoices);
  }

  createInvoiceFromDues(
    clientId: string,
    clientName: string,
    clientEmail: string,
    clientAddress: string,
    dues: Due[],
    taxRate: number = 0,
    notes?: string
  ): Observable<Invoice> {
    const items: InvoiceItem[] = dues.map(due => ({
      dueId: due.id,
      productName: due.productName,
      amount: due.amount,
      dueDate: due.dueDate,
      description: `Payment for ${due.productName}`
    }));

    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;

    const newInvoice: Invoice = {
      id: this.generateId(),
      invoiceId: this.generateInvoiceId(),
      clientId,
      clientName,
      clientEmail,
      clientAddress,
      items,
      subtotal,
      tax,
      taxRate,
      total,
      status: 'draft',
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      notes,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.invoices.push(newInvoice);
    this.invoicesSubject.next([...this.invoices]);

    return of(newInvoice);
  }

  updateInvoiceStatus(invoiceId: string, status: Invoice['status'], paidDate?: Date): Observable<Invoice | null> {
    const index = this.invoices.findIndex(i => i.id === invoiceId);
    if (index === -1) {
      return of(null);
    }

    this.invoices[index].status = status;
    this.invoices[index].updatedAt = new Date();
    
    if (status === 'paid' && paidDate) {
      this.invoices[index].paidDate = paidDate;
    }

    this.invoicesSubject.next([...this.invoices]);
    return of(this.invoices[index]);
  }

  deleteInvoice(id: string): Observable<boolean> {
    const index = this.invoices.findIndex(i => i.id === id);
    if (index === -1) {
      return of(false);
    }

    this.invoices.splice(index, 1);
    this.invoicesSubject.next([...this.invoices]);
    return of(true);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private generateInvoiceId(): string {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const invoiceNumber = String(this.invoiceCounter++).padStart(4, '0');
    return `INV-${year}${month}-${invoiceNumber}`;
  }

  private initializeSampleData(): void {
    // Sample invoice data would be initialized here
    const sampleInvoice: Invoice = {
      id: '1',
      invoiceId: 'INV-202501-0001',
      clientId: '1',
      clientName: 'ABC Corporation',
      clientEmail: 'contact@abc-corp.com',
      clientAddress: '123 Business St, Dubai, UAE',
      items: [
        {
          dueId: '1',
          productName: 'Website Hosting',
          amount: 299.99,
          dueDate: new Date('2024-03-01'),
          description: 'Monthly hosting service'
        }
      ],
      subtotal: 299.99,
      tax: 15.00,
      taxRate: 5,
      total: 314.99,
      status: 'sent',
      issueDate: new Date('2024-02-15'),
      dueDate: new Date('2024-03-15'),
      notes: 'Thank you for your business!',
      createdAt: new Date('2024-02-15'),
      updatedAt: new Date('2024-02-15')
    };

    this.invoices.push(sampleInvoice);
    this.invoiceCounter = 2;
    this.invoicesSubject.next([...this.invoices]);
  }

  // Get invoice statistics
  getInvoiceStats(): Observable<{
    totalInvoices: number;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    overdueCount: number;
  }> {
    const stats = {
      totalInvoices: this.invoices.length,
      totalAmount: this.invoices.reduce((sum, inv) => sum + inv.total, 0),
      paidAmount: this.invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0),
      pendingAmount: this.invoices.filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled').reduce((sum, inv) => sum + inv.total, 0),
      overdueCount: this.invoices.filter(inv => inv.status === 'overdue').length
    };

    return of(stats);
  }
}