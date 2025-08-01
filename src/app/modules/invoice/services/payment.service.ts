import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { Payment } from './invoice.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private payments: Payment[] = [];
  private paymentsSubject = new BehaviorSubject<Payment[]>(this.payments);
  private paymentCounter = 1;

  constructor() {
    this.initializeSampleData();
  }

  getAllPayments(): Observable<Payment[]> {
    return this.paymentsSubject.asObservable();
  }

  getPaymentsByClientId(clientId: string): Observable<Payment[]> {
    const clientPayments = this.payments.filter(p => p.clientId === clientId);
    return of(clientPayments);
  }

  getPaymentsByInvoiceId(invoiceId: string): Observable<Payment[]> {
    const invoicePayments = this.payments.filter(p => p.invoiceId === invoiceId);
    return of(invoicePayments);
  }

  recordPayment(
    invoiceId: string,
    clientId: string,
    amount: number,
    paymentMethod: Payment['paymentMethod'],
    paymentDate: Date,
    reference?: string,
    notes?: string
  ): Observable<Payment> {
    const newPayment: Payment = {
      id: this.generateId(),
      paymentId: this.generatePaymentId(),
      invoiceId,
      clientId,
      amount,
      paymentMethod,
      paymentDate,
      reference,
      notes,
      createdAt: new Date()
    };

    this.payments.push(newPayment);
    this.paymentsSubject.next([...this.payments]);

    return of(newPayment);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private generatePaymentId(): string {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const paymentNumber = String(this.paymentCounter++).padStart(4, '0');
    return `PAY-${year}${month}-${paymentNumber}`;
  }

  private initializeSampleData(): void {
    const samplePayment: Payment = {
      id: '1',
      paymentId: 'PAY-202501-0001',
      invoiceId: '1',
      clientId: '1',
      amount: 314.99,
      paymentMethod: 'bank_transfer',
      paymentDate: new Date('2024-02-20'),
      reference: 'TXN123456789',
      notes: 'Payment received via bank transfer',
      createdAt: new Date('2024-02-20')
    };

    this.payments.push(samplePayment);
    this.paymentCounter = 2;
    this.paymentsSubject.next([...this.payments]);
  }

  // Get payment statistics for a client
  getClientPaymentStats(clientId: string): Observable<{
    totalPayments: number;
    totalAmount: number;
    lastPaymentDate?: Date;
    averagePaymentAmount: number;
  }> {
    const clientPayments = this.payments.filter(p => p.clientId === clientId);
    
    const stats = {
      totalPayments: clientPayments.length,
      totalAmount: clientPayments.reduce((sum, payment) => sum + payment.amount, 0),
      lastPaymentDate: clientPayments.length > 0 
        ? new Date(Math.max(...clientPayments.map(p => p.paymentDate.getTime())))
        : undefined,
      averagePaymentAmount: clientPayments.length > 0 
        ? clientPayments.reduce((sum, payment) => sum + payment.amount, 0) / clientPayments.length
        : 0
    };

    return of(stats);
  }
}