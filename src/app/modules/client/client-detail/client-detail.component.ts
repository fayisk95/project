import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Client, ClientService } from '../services/client.service';

@Component({
  selector: 'app-client-detail',
  templateUrl: './client-detail.component.html',
  styleUrls: ['./client-detail.component.scss']
})
export class ClientDetailComponent implements OnInit {
  client?: Client;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService
  ) {}

  ngOnInit() {
    const clientId = this.route.snapshot.paramMap.get('id');
    if (clientId) {
      this.loadClient(clientId);
    } else {
      this.router.navigate(['/clients']);
    }
  }

  loadClient(id: string) {
    this.clientService.getClientById(id).subscribe(client => {
      this.isLoading = false;
      if (client) {
        this.client = client;
      } else {
        this.router.navigate(['/clients']);
      }
    });
  }
getWhatsappLink(number: string): string {
  if (!number) return '';
  const cleaned = number.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleaned}`;
}
  onEdit() {
    if (this.client) {
      this.router.navigate(['/clients/edit', this.client.id]);
    }
  }

  onBack() {
    this.router.navigate(['/clients']);
  }

  formatCurrency(amount: number): string {
    return `$${amount.toLocaleString()}`;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }
}