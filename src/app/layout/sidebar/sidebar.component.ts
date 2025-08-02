import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

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
  constructor(private authService: AuthService) { }

  get userRole(): string {
    return this.authService.getCurrentUser()?.role || 'user';
  }

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
      label: 'Products',
      icon: 'inventory_2',
      route: '/products'
    },
    {
      label: 'Dues',
      icon: 'receipt_long',
      route: '/dues'
    },
    {
      label: 'Collections',
      icon: 'receipt',
      route: '/invoices'
    }
  ];

  getFilteredMenuItems(): MenuItem[] {
    return this.menuItems.filter(item =>
      !item.roles || item.roles.includes(this.userRole)
    );
  }
}