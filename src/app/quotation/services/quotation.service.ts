import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface QuotationModule {
  id?: number;
  name: string;
  description: string;
  hours: number;
  cost: number;
}

export interface AdditionalCharge {
  id?: number;
  name: string;
  unitCost: number;
  quantity: number;
  total: number;
}

export interface Quotation {
  id?: number;
  projectTitle: string;
  clientCompany: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  executiveSummary: string;
  technologyStack: string;
  timeline: string;
  paymentTerms: string;
  assumptions: string;
  termsConditions: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  taxPercent: number;
  status: 'draft' | 'approved';
  grandTotal: number;
  modules: QuotationModule[];
  additionalCharges: AdditionalCharge[];
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class QuotationService {
  private readonly API_URL = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getAllQuotations(): Observable<Quotation[]> {
    return this.http.get<Quotation[]>(`${this.API_URL}/quotations`);
  }

  getQuotationById(id: number): Observable<Quotation> {
    return this.http.get<Quotation>(`${this.API_URL}/quotations/${id}`);
  }

  createQuotation(quotation: Quotation): Observable<Quotation> {
    return this.http.post<Quotation>(`${this.API_URL}/quotations`, quotation);
  }

  updateQuotation(id: number, quotation: Quotation): Observable<Quotation> {
    return this.http.put<Quotation>(`${this.API_URL}/quotations/${id}`, quotation);
  }

  deleteQuotation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/quotations/${id}`);
  }

  approveQuotation(id: number): Observable<Quotation> {
    return this.http.patch<Quotation>(`${this.API_URL}/quotations/${id}/approve`, {});
  }

  exportToPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.API_URL}/quotations/${id}/pdf`, {
      responseType: 'blob'
    });
  }

  calculateTotals(quotation: Quotation): number {
    // Calculate modules total
    const modulesTotal = quotation.modules.reduce((sum, module) => sum + module.cost, 0);
    
    // Calculate additional charges total
    const chargesTotal = quotation.additionalCharges.reduce((sum, charge) => sum + charge.total, 0);
    
    // Calculate subtotal
    const subtotal = modulesTotal + chargesTotal;
    
    // Apply discount
    let discountAmount = 0;
    if (quotation.discountType === 'percentage') {
      discountAmount = (subtotal * quotation.discountValue) / 100;
    } else {
      discountAmount = quotation.discountValue;
    }
    
    // Calculate after discount
    const afterDiscount = subtotal - discountAmount;
    
    // Apply tax
    const taxAmount = (afterDiscount * quotation.taxPercent) / 100;
    
    // Calculate grand total
    return afterDiscount + taxAmount;
  }
}