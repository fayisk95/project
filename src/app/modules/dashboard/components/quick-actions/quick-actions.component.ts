import { Component } from '@angular/core';
import { Router } from '@angular/router';

export interface QuickAction {
  label: string;
  icon: string;
  color: string;
  action: () => void;
}

@Component({
  selector: 'app-quick-actions',
  templateUrl: './quick-actions.component.html',
  styleUrls: ['./quick-actions.component.scss']
})
export class QuickActionsComponent {
  constructor(private router: Router) {}

  quickActions: QuickAction[] = [
    {
      label: 'Add Client',
      icon: 'person_add',
      color: 'primary',
      action: () => this.router.navigate(['/clients/add'])
    },
    {
      label: 'Create Invoice',
      icon: 'receipt_long',
      color: 'accent',
      action: () => console.log('Create Invoice')
    },
    {
      label: 'View Reports',
      icon: 'analytics',
      color: 'warn',
      action: () => console.log('View Reports')
    },
    {
      label: 'Settings',
      icon: 'settings',
      color: 'primary',
      action: () => console.log('Settings')
    }
  ];

  executeAction(action: QuickAction) {
    action.action();
  }
}