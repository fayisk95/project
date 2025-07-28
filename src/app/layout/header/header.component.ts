import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Output() menuToggle = new EventEmitter<void>();

  onMenuToggle() {
    this.menuToggle.emit();
  }

  onSettings() {
    // Implement settings functionality
    console.log('Settings clicked');
  }

  onLogout() {
    // Implement logout functionality
    console.log('Logout clicked');
  }
}