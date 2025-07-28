import { Component } from '@angular/core';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  userRole = 'admin'; // This would come from auth service

  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard'
    },
    {
      label: 'Clients',
      icon: 'people',
      route: '/clients'
    },
    {
      label: 'Invoices',
      icon: 'receipt',
      route: '/invoices',
      roles: ['admin', 'manager']
    },
    {
      label: 'Subscriptions',
      icon: 'subscriptions',
      route: '/subscriptions'
    },
    {
      label: 'Reports',
      icon: 'analytics',
      route: '/reports',
      roles: ['admin']
    },
    {
      label: 'Settings',
      icon: 'settings',
      route: '/settings',
      roles: ['admin']
    }
  ];

  getFilteredMenuItems(): MenuItem[] {
    return this.menuItems.filter(item => 
      !item.roles || item.roles.includes(this.userRole)
    );
  }
}