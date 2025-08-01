import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Due, DueService } from '../../product/services/due.service';

@Component({
  selector: 'app-due-detail',
  templateUrl: './due-detail.component.html',
  styleUrls: ['./due-detail.component.scss']
})
export class DueDetailComponent implements OnInit {
  due?: Due;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dueService: DueService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    const dueId = this.route.snapshot.paramMap.get('id');
    if (dueId) {
      this.loadDue(dueId);
    } else {
      this.router.navigate(['/dues']);
    }
  }

  loadDue(id: string) {
    this.dueService.getDueById(id).subscribe(due => {
      this.isLoading = false;
      if (due) {
        this.due = due;
      } else {
        this.router.navigate(['/dues']);
      }
    });
  }

  onBack() {
    this.router.navigate(['/dues']);
  }

  onMarkAsPaid() {
    if (this.due && this.due.status === 'pending') {
      this.dueService.markDueAsPaid(this.due.id).subscribe(updatedDue => {
        if (updatedDue) {
          this.due = updatedDue;
          this.snackBar.open('Due marked as paid successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
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

  formatDateTime(date: Date): string {
    return new Date(date).toLocaleString();
  }

  getDueStatusClass(): string {
    if (!this.due) return '';
    
    const now = new Date();
    const dueDate = new Date(this.due.dueDate);
    const expiryDate = new Date(this.due.expiryDate);

    if (this.due.status === 'paid') return 'paid';
    if (this.due.status === 'expired' || expiryDate < now) return 'overdue';
    if (this.due.status === 'cancelled') return 'cancelled';
    
    if (dueDate <= now) return 'current';
    
    const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil <= 7) return 'upcoming';
    
    return 'future';
  }

  getDueStatusText(): string {
    const statusClass = this.getDueStatusClass();
    
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

  getDaysUntilDue(): number {
    if (!this.due) return 0;
    const now = new Date();
    const due = new Date(this.due.dueDate);
    return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  getOverdueDays(): number {
    if (!this.due) return 0;
    const now = new Date();
    const expiry = new Date(this.due.expiryDate);
    return Math.ceil((now.getTime() - expiry.getTime()) / (1000 * 60 * 60 * 24));
  }
}