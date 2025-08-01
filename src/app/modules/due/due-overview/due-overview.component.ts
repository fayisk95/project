import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Due, DueService } from '../../product/services/due.service';

interface DueStats {
  totalPending: number;
  totalOverdue: number;
  totalUpcoming: number;
  totalAmount: number;
  overdueAmount: number;
  upcomingAmount: number;
}

interface DuesByStatus {
  pending: Due[];
  overdue: Due[];
  upcoming: Due[];
  paid: Due[];
}

@Component({
  selector: 'app-due-overview',
  templateUrl: './due-overview.component.html',
  styleUrls: ['./due-overview.component.scss']
})
export class DueOverviewComponent implements OnInit {
  dueStats$!: Observable<DueStats>;
  duesByStatus$!: Observable<DuesByStatus>;
  allDues$!: Observable<Due[]>;

  constructor(
    private dueService: DueService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadDueData();
  }

  loadDueData() {
    this.allDues$ = this.dueService.getAllDues();

    this.duesByStatus$ = this.allDues$.pipe(
      map(dues => this.categorizeDues(dues))
    );

    this.dueStats$ = this.duesByStatus$.pipe(
      map(categorized => this.calculateStats(categorized))
    );
  }

  private categorizeDues(dues: Due[]): DuesByStatus {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return {
      pending: dues.filter(due => 
        due.status === 'pending' && 
        new Date(due.dueDate) <= now &&
        new Date(due.expiryDate) > now
      ),
      overdue: dues.filter(due => due.status === 'expired'),
      upcoming: dues.filter(due => 
        due.status === 'pending' && 
        new Date(due.dueDate) > now &&
        new Date(due.dueDate) <= sevenDaysFromNow
      ),
      paid: dues.filter(due => due.status === 'paid')
    };
  }

  private calculateStats(categorized: DuesByStatus): DueStats {
    return {
      totalPending: categorized.pending.length,
      totalOverdue: categorized.overdue.length,
      totalUpcoming: categorized.upcoming.length,
      totalAmount: categorized.pending.reduce((sum, due) => sum + due.amount, 0),
      overdueAmount: categorized.overdue.reduce((sum, due) => sum + due.amount, 0),
      upcomingAmount: categorized.upcoming.reduce((sum, due) => sum + due.amount, 0)
    };
  }

  onViewAllDues() {
    this.router.navigate(['/dues/list']);
  }

  onViewDueDetail(due: Due) {
    this.router.navigate(['/dues', due.id]);
  }

  formatCurrency(amount: number): string {
    return `$${amount.toLocaleString()}`;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  getDaysUntilDue(dueDate: Date): number {
    const now = new Date();
    const due = new Date(dueDate);
    return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  getDueStatusClass(due: Due): string {
    const now = new Date();
    const dueDate = new Date(due.dueDate);
    const expiryDate = new Date(due.expiryDate);

    if (due.status === 'paid') return 'paid';
    if (due.status === 'expired' || expiryDate < now) return 'overdue';
    if (due.status === 'cancelled') return 'cancelled';
    
    if (dueDate <= now) return 'current';
    
    const daysUntil = this.getDaysUntilDue(dueDate);
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

  markDueAsPaid(due: Due, event: Event) {
    event.stopPropagation();
    if (due.status === 'pending') {
      this.dueService.markDueAsPaid(due.id).subscribe(() => {
        this.loadDueData();
      });
    }
  }
}