import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Due, DueService } from '../../product/services/due.service';

@Component({
  selector: 'app-due-list',
  templateUrl: './due-list.component.html',
  styleUrls: ['./due-list.component.scss']
})
export class DueListComponent implements OnInit {
  dues: Due[] = [];
  filteredDues: Due[] = [];
  displayedColumns: string[] = ['dueId', 'productName', 'clientName', 'amount', 'dueDate', 'status', 'actions'];
  searchTerm = '';
  statusFilter = 'all';

  statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'expired', label: 'Overdue' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  constructor(
    private dueService: DueService,
    public router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.loadDues();
  }

  loadDues() {
    this.dueService.getAllDues().subscribe(dues => {
      this.dues = dues.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      this.applyFilters();
    });
  }

  applyFilters() {
    let filtered = [...this.dues];

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(due =>
        due.dueId.toLowerCase().includes(term) ||
        due.productName.toLowerCase().includes(term) ||
        due.clientName.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(due => due.status === this.statusFilter);
    }

    this.filteredDues = filtered;
  }

  onSearchChange() {
    this.applyFilters();
  }

  onStatusFilterChange() {
    this.applyFilters();
  }

  onViewDue(due: Due) {
    this.router.navigate(['/dues', due.id]);
  }

  onMarkAsPaid(due: Due) {
    if (due.status === 'pending') {
      this.dueService.markDueAsPaid(due.id).subscribe(updatedDue => {
        if (updatedDue) {
          this.snackBar.open('Due marked as paid successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadDues();
        }
      });
    }
  }

  formatCurrency(amount: number): string {
    return `$${amount.toLocaleString()}`;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  getDueStatusClass(due: Due): string {
    const now = new Date();
    const dueDate = new Date(due.dueDate);
    const expiryDate = new Date(due.expiryDate);

    if (due.status === 'paid') return 'paid';
    if (due.status === 'expired' || expiryDate < now) return 'overdue';
    if (due.status === 'cancelled') return 'cancelled';

    if (dueDate <= now) return 'current';

    const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil <= 7) return 'upcoming';

    return 'future';
  }

  getDueStatusText(due: Due): string {
    const statusClass = this.getDueStatusClass(due);

    switch (statusClass) {
      case 'paid': return 'Paid';
      case 'overdue': return 'Overdue';
      case 'cancelled': return 'Cancelled';
      case 'current': return 'Due Now';
      case 'upcoming': return 'Upcoming';
      case 'future': return 'Future';
      default: return 'Unknown';
    }
  }

  getDaysUntilDue(dueDate: Date): number {
    const now = new Date();
    const due = new Date(dueDate);
    return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  getOverdueDays(expiryDate: Date): number {
    const now = new Date();
    const expiry = new Date(expiryDate);
    return Math.ceil((now.getTime() - expiry.getTime()) / (1000 * 60 * 60 * 24));
  }
}