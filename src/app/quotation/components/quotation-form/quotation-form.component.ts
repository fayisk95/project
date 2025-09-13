import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { QuotationService, Quotation, QuotationModule, AdditionalCharge } from '../../services/quotation.service';
import { ModuleDialogComponent } from '../module-dialog/module-dialog.component';
import { AdditionalChargesDialogComponent } from '../additional-charges-dialog/additional-charges-dialog.component';
import { CustomerService, Customer } from '../../../customer/services/customer.service';

@Component({
  selector: 'app-quotation-form',
  templateUrl: './quotation-form.component.html',
  styleUrls: ['./quotation-form.component.css']
})
export class QuotationFormComponent implements OnInit {
  quotationForm!: FormGroup;
  isEditMode = false;
  quotationId: number | null = null;
  isLoading = false;
  modules: QuotationModule[] = [];
  additionalCharges: AdditionalCharge[] = [];
  customers: Customer[] = [];
  selectedCustomer: Customer | null = null;

  constructor(
    private fb: FormBuilder,
    private quotationService: QuotationService,
    private customerService: CustomerService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.loadCustomers();
    this.checkEditMode();
  }

  initializeForm() {
    this.quotationForm = this.fb.group({
      projectTitle: ['', Validators.required],
      customerId: [''],
      clientCompany: ['', Validators.required],
      clientName: ['', Validators.required],
      clientEmail: ['', [Validators.required, Validators.email]],
      clientPhone: ['', Validators.required],
      clientAddress: ['', Validators.required],
      executiveSummary: ['', Validators.required],
      technologyStack: ['', Validators.required],
      timeline: ['', Validators.required],
      paymentTerms: [''],
      assumptions: [''],
      termsConditions: [''],
      discountType: ['percentage'],
      discountValue: [0, [Validators.min(0)]],
      taxPercent: [5, [Validators.min(0), Validators.max(100)]]
    });

    // Watch for customer selection changes
    this.quotationForm.get('customerId')?.valueChanges.subscribe(customerId => {
      this.onCustomerSelected(customerId);
    });
  }

  loadCustomers() {
    this.customerService.getAllCustomers().subscribe({
      next: (customers) => {
        this.customers = customers;
      },
      error: (error) => {
        console.error('Error loading customers:', error);
        this.snackBar.open('Error loading customers', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onCustomerSelected(customerId: number) {
    if (customerId) {
      const customer = this.customers.find(c => c.id === customerId);
      if (customer) {
        this.selectedCustomer = customer;
        this.quotationForm.patchValue({
          clientCompany: customer.companyName,
          clientName: customer.contactName,
          clientEmail: customer.email,
          clientPhone: customer.phone,
          clientAddress: customer.address
        });
      }
    } else {
      this.selectedCustomer = null;
      this.quotationForm.patchValue({
        clientCompany: '',
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        clientAddress: ''
      });
    }
  }

  checkEditMode() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && this.route.snapshot.url.some(segment => segment.path === 'edit')) {
      this.isEditMode = true;
      this.quotationId = +id;
      this.loadQuotation();
    }
  }

  loadQuotation() {
    if (this.quotationId) {
      this.isLoading = true;
      this.quotationService.getQuotationById(this.quotationId).subscribe({
        next: (quotation) => {
          this.quotationForm.patchValue(quotation);
          this.modules = quotation.modules || [];
          this.additionalCharges = quotation.additionalCharges || [];
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading quotation:', error);
          this.isLoading = false;
          this.snackBar.open('Error loading quotation', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  addModule() {
    const dialogRef = this.dialog.open(ModuleDialogComponent, {
      width: '600px',
      data: null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.modules.push(result);
      }
    });
  }

  editModule(index: number) {
    const dialogRef = this.dialog.open(ModuleDialogComponent, {
      width: '600px',
      data: this.modules[index]
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.modules[index] = result;
      }
    });
  }

  removeModule(index: number) {
    this.modules.splice(index, 1);
  }

  addAdditionalCharge() {
    const dialogRef = this.dialog.open(AdditionalChargesDialogComponent, {
      width: '500px',
      data: null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.additionalCharges.push(result);
      }
    });
  }

  editAdditionalCharge(index: number) {
    const dialogRef = this.dialog.open(AdditionalChargesDialogComponent, {
      width: '500px',
      data: this.additionalCharges[index]
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.additionalCharges[index] = result;
      }
    });
  }

  removeAdditionalCharge(index: number) {
    this.additionalCharges.splice(index, 1);
  }

  getModulesTotal(): number {
    return this.modules.reduce((total, module) => total + module.cost, 0);
  }

  getChargesTotal(): number {
    return this.additionalCharges.reduce((total, charge) => total + charge.total, 0);
  }

  getSubtotal(): number {
    return this.getModulesTotal() + this.getChargesTotal();
  }

  getDiscountAmount(): number {
    const subtotal = this.getSubtotal();
    const discountType = this.quotationForm.get('discountType')?.value;
    const discountValue = this.quotationForm.get('discountValue')?.value || 0;

    if (discountType === 'percentage') {
      return (subtotal * discountValue) / 100;
    }
    return discountValue;
  }

  getTaxAmount(): number {
    const afterDiscount = this.getSubtotal() - this.getDiscountAmount();
    const taxPercent = this.quotationForm.get('taxPercent')?.value || 0;
    return (afterDiscount * taxPercent) / 100;
  }

  getGrandTotal(): number {
    return this.getSubtotal() - this.getDiscountAmount() + this.getTaxAmount();
  }

  onSubmit() {
    if (this.quotationForm.valid) {
      const quotationData: Quotation = {
        ...this.quotationForm.value,
        modules: this.modules,
        additionalCharges: this.additionalCharges,
        grandTotal: this.getGrandTotal(),
        status: 'draft'
      };

      this.isLoading = true;

      const operation = this.isEditMode && this.quotationId 
        ? this.quotationService.updateQuotation(this.quotationId, quotationData)
        : this.quotationService.createQuotation(quotationData);

      operation.subscribe({
        next: (quotation) => {
          this.isLoading = false;
          this.snackBar.open(
            this.isEditMode ? 'Quotation updated successfully!' : 'Quotation created successfully!',
            'Close',
            {
              duration: 3000,
              panelClass: ['success-snackbar']
            }
          );
          this.router.navigate(['/quotations']);
        },
        error: (error) => {
          console.error('Error saving quotation:', error);
          this.isLoading = false;
          this.snackBar.open(
            'Error saving quotation. Please try again.',
            'Close',
            {
              duration: 5000,
              panelClass: ['error-snackbar']
            }
          );
        }
      });
    }
  }

  onCancel() {
    this.router.navigate(['/quotations']);
  }
}