import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';

// Components
import { QuotationListComponent } from './components/quotation-list/quotation-list.component';
import { QuotationFormComponent } from './components/quotation-form/quotation-form.component';
import { QuotationDetailComponent } from './components/quotation-detail/quotation-detail.component';
import { ModuleDialogComponent } from './components/module-dialog/module-dialog.component';
import { AdditionalChargesDialogComponent } from './components/additional-charges-dialog/additional-charges-dialog.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';

const routes = [
  { path: '', component: QuotationListComponent },
  { path: 'new', component: QuotationFormComponent },
  { path: ':id', component: QuotationDetailComponent },
  { path: ':id/edit', component: QuotationFormComponent }
];

@NgModule({
  declarations: [
    QuotationListComponent,
    QuotationFormComponent,
    QuotationDetailComponent,
    ModuleDialogComponent,
    AdditionalChargesDialogComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes),
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTabsModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressBarModule,
    MatCheckboxModule
  ]
})
export class QuotationModule { }