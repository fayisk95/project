import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Client, ClientService } from '../../client/services/client.service';
import { Due, DueService } from '../../product/services/due.service';
import { InvoiceService } from '../services/invoice.service';

@Component({
  selector: 'app-invoice-form',
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.scss']
})
export class InvoiceFormComponent implements OnInit {
  invoiceForm!: FormGroup;
  clients$!: Observable<Client[]>;
  selectedClientDues$!: Observable<Due[]>;
  isLoading = false;
  preselectedClientId?: string;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService,
    private dueService: DueService,
    private invoiceService: InvoiceService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.loadClients();
    this.checkPreselectedClient();
    this.setupFormSubscriptions();
  }

  initializeForm() {
    this.invoiceForm = this.formBuilder.group({
      clientId: ['', Validators.required],
      selectedDues: [[], Validators.required],
      taxRate: [0, [Validators.min(0), Validators.max(100)]],
      notes: ['']
    });
  }

  loadClients() {
    this.clients$ = this.clientService.getAllClients();
  }

  checkPreselectedClient() {
    this.preselectedClientId = this.route.snapshot.paramMap.get('clientId') || undefined;
    if (this.preselectedClientId) {
      this.invoiceForm.patchValue({ clientId: this.preselectedClientId });
      this.loadClientDues(this.preselectedClientId);
    }
  }

  setupFormSubscriptions() {
    this.invoiceForm.get('clientId')?.valueChanges.subscribe(clientId => {
      if (clientId) {
        this.loadClientDues(clientId);
        this.invoiceForm.patchValue({ selectedDues: [] });
      }
    });
  }

  loadClientDues(clientId: string) {
    this.selectedClientDues$ = this.dueService.getDuesByClientId(clientId).pipe(
      map(dues => dues.filter(due => due.status === 'pending'))
    );
  }

  onDueSelectionChange(due: Due, isSelected: boolean) {
    const selectedDues = this.invoiceForm.get('selectedDues')?.value || [];
    
    if (isSelected) {
      if (!selectedDues.find((d: Due) => d.id === due.id)) {
        selectedDues.push(due);
      }
    } else {
      const index = selectedDues.findIndex((d: Due) => d.id === due.id);
      if (index > -1) {
        selectedDues.splice(index, 1);
      }
    }
    
    this.invoiceForm.patchValue({ selectedDues });
  }

  isDueSelected(due: Due): boolean {
    const selectedDues = this.invoiceForm.get('selectedDues')?.value || [];
    return selectedDues.some((d: Due) => d.id === due.id);
  }

  getSelectedDuesTotal(): number {
    const selectedDues = this.invoiceForm.get('selectedDues')?.value || [];
    return selectedDues.reduce((total: number, due: Due) => total + due.amount, 0);
  }

  getTaxAmount(): number {
    const subtotal = this.getSelectedDuesTotal();
    const taxRate = this.invoiceForm.get('taxRate')?.value || 0;
    return subtotal * (taxRate / 100);
  }

  getGrandTotal(): number {
    return this.getSelectedDuesTotal() + this.getTaxAmount();
  }

  onSubmit() {
    if (this.invoiceForm.valid) {
      this.isLoading = true;
      const formValue = this.invoiceForm.value;

      // Get client details
      this.clientService.getClientById(formValue.clientId).subscribe(client => {
        if (!client) {
          this.snackBar.open('Selected client not found', 'Close', { duration: 3000 });
          this.isLoading = false;
          return;
        }

        // Create invoice
        this.invoiceService.createInvoiceFromDues(
          client.id,
          client.nameEn,
          client.email,
          client.address,
          formValue.selectedDues,
          formValue.taxRate,
          formValue.notes
        ).subscribe(invoice => {
          this.isLoading = false;
          this.snackBar.open('Invoice created successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/invoices', invoice.id]);
        });
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel() {
    this.router.navigate(['/invoices']);
  }

  private markFormGroupTouched() {
    Object.keys(this.invoiceForm.controls).forEach(key => {
      const control = this.invoiceForm.get(key);
      control?.markAsTouched();
    });
  }

  formatCurrency(amount: number): string {
    return `$${amount.toLocaleString()}`;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  getErrorMessage(fieldName: string): string {
    const control = this.invoiceForm.get(fieldName);

    if (control?.hasError('required')) {
      return `${fieldName} is required`;
    }
    if (control?.hasError('min')) {
      return `${fieldName} must be greater than or equal to ${control.errors?.['min'].min}`;
    }
    if (control?.hasError('max')) {
      return `${fieldName} must be less than or equal to ${control.errors?.['max'].max}`;
    }
    return '';
  }
}