import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'SmartDocs – Quotation & BRD Generator';
  isLoggedIn = false;
  userRole = '';
  userName = '';
  currentPageTitle = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.isLoggedIn = !!user;
      this.userRole = user?.role || '';
      this.userName = user?.name || '';
    });
    
    // Listen to route changes to update page title
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.getPageTitle())
    ).subscribe(title => {
      this.currentPageTitle = title;
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  isAdmin(): boolean {
    return this.userRole === 'admin';
  }
  
  getPageTitle(): string {
    const url = this.router.url;
    if (url.includes('/quotations')) {
      if (url.includes('/new')) return 'New Quotation';
      if (url.includes('/edit')) return 'Edit Quotation';
      if (url.match(/\/quotations\/\d+$/)) return 'Quotation Details';
      return 'Quotations';
    }
    if (url.includes('/brds')) {
      if (url.match(/\/brds\/\d+$/)) return 'BRD Details';
      return 'Business Requirements Documents';
    }
    if (url.includes('/customers')) return 'Customers';
    if (url.includes('/admin')) return 'Admin Dashboard';
    return 'SmartDocs';
  }
}