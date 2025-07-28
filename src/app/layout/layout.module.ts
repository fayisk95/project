import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { MainLayoutComponent } from './main-layout/main-layout.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HeaderComponent } from './header/header.component';

@NgModule({
  declarations: [
    MainLayoutComponent,
    SidebarComponent,
    HeaderComponent
  ],
  imports: [
    SharedModule,
    RouterModule
  ],
  exports: [
    MainLayoutComponent
  ]
})
export class LayoutModule { }