import { Component, OnInit } from '@angular/core';

export interface KpiData {
  title: string;
  value: number;
  icon: string;
  trend: 'up' | 'down' | 'neutral';
  trendValue: number;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  kpis: KpiData[] = [
    {
      title: 'Total Clients',
      value: 156,
      icon: 'people',
      trend: 'up',
      trendValue: 12,
      color: 'primary'
    },
    {
      title: 'Active Subscriptions',
      value: 89,
      icon: 'subscriptions',
      trend: 'up',
      trendValue: 8,
      color: 'success'
    },
    {
      title: 'Outstanding Dues',
      value: 25400,
      icon: 'account_balance_wallet',
      trend: 'down',
      trendValue: 5,
      color: 'warning'
    },
    {
      title: 'Recurring Clients',
      value: 67,
      icon: 'repeat',
      trend: 'up',
      trendValue: 15,
      color: 'info'
    }
  ];

  ngOnInit() {
    // Initialize dashboard data
  }
}