import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CompanySettings {
  id?: number;
  companyName: string;
  logoUrl: string;
  address: string;
  taxPercent: number;
  termsConditions: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly API_URL = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getCompanySettings(): Observable<CompanySettings> {
    return this.http.get<CompanySettings>(`${this.API_URL}/admin/company-settings`);
  }

  updateCompanySettings(settings: CompanySettings): Observable<CompanySettings> {
    return this.http.put<CompanySettings>(`${this.API_URL}/admin/company-settings`, settings);
  }

  uploadLogo(file: File): Observable<{ logoUrl: string }> {
    const formData = new FormData();
    formData.append('logo', file);
    return this.http.post<{ logoUrl: string }>(`${this.API_URL}/admin/upload-logo`, formData);
  }
}