import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';

export interface Client {
  id: string;
  nameEn: string;
  nameAr?: string;
  clientId: string;
  address: string;
  email: string;
  contactNumber: string;
  whatsappNumber: string;
  poc: {
    contactNumber: string;
    whatsappNumber: string;
    email: string;
  };
  hostingPlatform: {
    name: string;
    accountDetails: string;
  };
  totalOutstanding: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private clients: Client[] = [
    {
      id: '1',
      nameEn: 'ABC Corporation',
      nameAr: 'شركة أي بي سي',
      clientId: 'CL-001',
      address: '123 Business St, Dubai, UAE',
      email: 'contact@abc-corp.com',
      contactNumber: '+971-50-123-4567',
      whatsappNumber: '+971-50-123-4567',
      poc: {
        contactNumber: '+971-50-987-6543',
        whatsappNumber: '+971-50-987-6543',
        email: 'manager@abc-corp.com'
      },
      hostingPlatform: {
        name: 'AWS',
        accountDetails: 'aws-account-123456'
      },
      totalOutstanding: 5500.00,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20')
    },
    {
      id: '2',
      nameEn: 'XYZ Limited',
      clientId: 'CL-002',
      address: '456 Commerce Ave, Abu Dhabi, UAE',
      email: 'info@xyz-ltd.com',
      contactNumber: '+971-50-234-5678',
      whatsappNumber: '+971-50-234-5678',
      poc: {
        contactNumber: '+971-50-876-5432',
        whatsappNumber: '+971-50-876-5432',
        email: 'admin@xyz-ltd.com'
      },
      hostingPlatform: {
        name: 'Google Cloud',
        accountDetails: 'gcp-project-xyz789'
      },
      totalOutstanding: 2300.00,
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-05')
    }
  ];

  private clientsSubject = new BehaviorSubject<Client[]>(this.clients);

  getAllClients(): Observable<Client[]> {
    return this.clientsSubject.asObservable();
  }

  getClientById(id: string): Observable<Client | undefined> {
    const client = this.clients.find(c => c.id === id);
    return of(client);
  }

  createClient(client: Omit<Client, 'id' | 'clientId' | 'createdAt' | 'updatedAt'>): Observable<Client> {
    const newClient: Client = {
      ...client,
      id: this.generateId(),
      clientId: this.generateClientId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.clients.push(newClient);
    this.clientsSubject.next([...this.clients]);
    return of(newClient);
  }

  updateClient(id: string, updates: Partial<Client>): Observable<Client | null> {
    const index = this.clients.findIndex(c => c.id === id);
    if (index === -1) {
      return of(null);
    }

    this.clients[index] = {
      ...this.clients[index],
      ...updates,
      updatedAt: new Date()
    };

    this.clientsSubject.next([...this.clients]);
    return of(this.clients[index]);
  }

  deleteClient(id: string): Observable<boolean> {
    const index = this.clients.findIndex(c => c.id === id);
    if (index === -1) {
      return of(false);
    }

    this.clients.splice(index, 1);
    this.clientsSubject.next([...this.clients]);
    return of(true);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private generateClientId(): string {
    const count = this.clients.length + 1;
    return `CL-${count.toString().padStart(3, '0')}`;
  }
}