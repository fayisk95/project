import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';

// Components
import { BrdListComponent } from './components/brd-list/brd-list.component';
import { BrdDetailComponent } from './components/brd-detail/brd-detail.component';

const routes = [
  { path: '', component: BrdListComponent },
  { path: ':id', component: BrdDetailComponent }
];

@NgModule({
  declarations: [
    BrdListComponent,
    BrdDetailComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatTabsModule,
    MatProgressBarModule
  ]
})
export class BrdModule { }