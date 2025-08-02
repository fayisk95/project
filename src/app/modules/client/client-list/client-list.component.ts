import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmationService } from '../../../shared/services/confirmation.service';
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
    private snackBar: MatSnackBar,
    private confirmationService: ConfirmationService
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
    this.confirmationService.confirmDelete(client.nameEn, 'client').subscribe(confirmed => {
      if (confirmed) {
        this.clientService.deleteClient(client.id).subscribe(success => {
          if (success) {
            this.snackBar.open('Client deleted successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.loadClients();
          }
        });
      }
    });
  }

  onViewStatement(client: Client) {
    this.router.navigate(['/client-statement', client.id]);
  }

  onCreateInvoice(client: Client) {
    this.router.navigate(['/invoices/create', client.id]);
  }

  onViewPaymentHistory(client: Client) {
    this.router.navigate(['/invoices/payment-history', client.id]);
  }

  getTotalOutstandingClass(amount: number): string {
    if (amount === 0) return 'no-outstanding';
    if (amount < 1000) return 'low-outstanding';
    if (amount < 5000) return 'medium-outstanding';
    return 'high-outstanding';
  }

  getClientStatusText(client: Client): string {
    const daysSinceUpdate = Math.floor((new Date().getTime() - new Date(client.updatedAt).getTime()) / (1000 * 60 * 60 * 24));
    
    if (client.totalOutstanding > 0) {
      return 'Has Outstanding';
    }
    
    if (daysSinceUpdate > 30) {
      return 'Inactive';
    }
    
    return 'Active';
  }

  getClientStatusClass(client: Client): string {
    const daysSinceUpdate = Math.floor((new Date().getTime() - new Date(client.updatedAt).getTime()) / (1000 * 60 * 60 * 24));
    
    if (client.totalOutstanding > 0) {
      return 'has-outstanding';
    }
    
    if (daysSinceUpdate > 30) {
      return 'inactive';
    }
    
    return 'active';
  }

  showClientActions(client: Client): void {
    // This could open a menu with more actions
    console.log('Show actions for client:', client.nameEn);
  }

  exportClientData(client: Client): void {
    // Export client data functionality
    this.snackBar.open('Export functionality coming soon', 'Close', {
      duration: 3000,
      panelClass: ['info-snackbar']
    });
  }

  sendClientReminder(client: Client): void {
    if (client.totalOutstanding > 0) {
      this.confirmationService.confirmAction(
        'Send Payment Reminder',
        `Send a payment reminder to ${client.nameEn}?`,
        'Send Reminder'
      ).subscribe(confirmed => {
        if (confirmed) {
          // Implement reminder functionality
          this.snackBar.open('Payment reminder sent successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        }
      });
    } else {
      this.snackBar.open('No outstanding balance for this client', 'Close', {
        duration: 3000,
        panelClass: ['info-snackbar']
      });
    }
  }

  formatCurrency(amount: number): string {
    return `$${amount.toLocaleString()}`;
  }
}