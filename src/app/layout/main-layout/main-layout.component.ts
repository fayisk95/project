import { Component } from '@angular/core';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent {
  sidebarOpen = true;

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
}