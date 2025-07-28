import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Client, ClientService } from '../services/client.service';

@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.scss']
})
export class ClientListComponent implements OnInit {
  clients: Client[] = [];
  displayedColumns: string[] = ['clientId', 'nameEn', 'email', 'contactNumber', 'totalOutstanding', 'actions'];
  searchTerm = '';

  constructor(
    private clientService: ClientService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadClients();
  }

  loadClients() {
    this.clientService.getAllClients().subscribe(clients => {
      this.clients = clients;
    });
  }

  get filteredClients() {
    if (!this.searchTerm) {
      return this.clients;
    }

    const term = this.searchTerm.toLowerCase();
    return this.clients.filter(client =>
      client.nameEn.toLowerCase().includes(term) ||
      client.email.toLowerCase().includes(term) ||
      client.clientId.toLowerCase().includes(term)
    );
  }

  onAddClient() {
    this.router.navigate(['/clients/add']);
  }

  onEditClient(client: Client) {
    this.router.navigate(['/clients/edit', client.id]);
  }

  onViewClient(client: Client) {
    this.router.navigate(['/clients', client.id]);
  }

  onDeleteClient(client: Client) {
    if (confirm(`Are you sure you want to delete ${client.nameEn}?`)) {
      this.clientService.deleteClient(client.id).subscribe(success => {
        if (success) {
          this.snackBar.open('Client deleted successfully', 'Close', {
            duration: 3000
          });
          this.loadClients();
        }
      });
    }
  }

  formatCurrency(amount: number): string {
    return `$${amount.toLocaleString()}`;
  }
}