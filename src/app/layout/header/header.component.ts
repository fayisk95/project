import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService, User } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Output() menuToggle = new EventEmitter<void>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  get currentUser(): User | null {
    return this.authService.getCurrentUser();
  }

  onMenuToggle() {
    this.menuToggle.emit();
  }

  onSettings() {
    // Implement settings functionality
    console.log('Settings clicked');
  }

  onLogout() {
    this.authService.logout();
    this.snackBar.open('Logged out successfully', 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
    this.router.navigate(['/login']);
  }
}