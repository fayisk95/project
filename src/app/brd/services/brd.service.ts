import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BRD {
  id: number;
  quotationId: number;
  quotation?: any;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class BrdService {
  private readonly API_URL = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getAllBrds(): Observable<BRD[]> {
    return this.http.get<BRD[]>(`${this.API_URL}/brds`);
  }

  getBrdById(id: number): Observable<BRD> {
    return this.http.get<BRD>(`${this.API_URL}/brds/${id}`);
  }

  exportToPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.API_URL}/brds/${id}/pdf`, {
      responseType: 'blob'
    });
  }
}