import { Component, OnInit } from '@angular/core';

export interface Activity {
  id: string;
  type: 'client' | 'invoice' | 'subscription';
  message: string;
  timestamp: Date;
  icon: string;
}

@Component({
  selector: 'app-recent-activity',
  templateUrl: './recent-activity.component.html',
  styleUrls: ['./recent-activity.component.scss']
})
export class RecentActivityComponent implements OnInit {
  activities: Activity[] = [
    {
      id: '1',
      type: 'client',
      message: 'New client "ABC Corp" added',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      icon: 'person_add'
    },
    {
      id: '2',
      type: 'invoice',
      message: 'Invoice #INV-001 paid by XYZ Ltd',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      icon: 'payment'
    },
    {
      id: '3',
      type: 'subscription',
      message: 'Subscription renewed for DEF Inc',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      icon: 'refresh'
    },
    {
      id: '4',
      type: 'client',
      message: 'Client information updated',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      icon: 'edit'
    }
  ];

  ngOnInit() {
    // Load recent activities
  }

  getTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  }
}