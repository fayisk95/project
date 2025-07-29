import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { Product, ProductService } from '../services/product.service';
import { Client, ClientService } from '../../client/services/client.service';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {
  productForm!: FormGroup;
  isEditMode = false;
  productId?: string;
  isLoading = false;
  clients$!: Observable<Client[]>;

  recurringFrequencies = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private clientService: ClientService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.loadClients();
    this.checkEditMode();
    this.setupFormSubscriptions();
  }

  initializeForm() {
    this.productForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      clientId: ['', Validators.required],
      paymentAmount: [0, [Validators.required, Validators.min(0.01)]],
      isRecurring: [false],
      recurringFrequency: ['monthly'],
      recurringStartDate: [''],
      isActive: [true]
    });
  }

  loadClients() {
    this.clients$ = this.clientService.getAllClients();
  }

  checkEditMode() {
    this.productId = this.route.snapshot.paramMap.get('id') || undefined;
    this.isEditMode = !!this.productId;

    if (this.isEditMode && this.productId) {
      this.loadProduct(this.productId);
    }
  }

  setupFormSubscriptions() {
    // Watch for recurring checkbox changes
    this.productForm.get('isRecurring')?.valueChanges.subscribe(isRecurring => {
      const frequencyControl = this.productForm.get('recurringFrequency');
      const startDateControl = this.productForm.get('recurringStartDate');

      if (isRecurring) {
        frequencyControl?.setValidators([Validators.required]);
        startDateControl?.setValidators([Validators.required]);
        
        // Set default start date to today if not set
        if (!startDateControl?.value) {
          startDateControl?.setValue(new Date().toISOString().split('T')[0]);
        }
      } else {
        frequencyControl?.clearValidators();
        startDateControl?.clearValidators();
      }

      frequencyControl?.updateValueAndValidity();
      startDateControl?.updateValueAndValidity();
    });
  }

  loadProduct(id: string) {
    this.isLoading = true;
    this.productService.getProductById(id).subscribe(product => {
      this.isLoading = false;
      if (product) {
        const formValue = {
          ...product,
          recurringStartDate: product.recurringStartDate ? 
            new Date(product.recurringStartDate).toISOString().split('T')[0] : ''
        };
        this.productForm.patchValue(formValue);
      } else {
        this.snackBar.open('Product not found', 'Close', { duration: 3000 });
        this.router.navigate(['/products']);
      }
    });
  }

  onSubmit() {
    if (this.productForm.valid) {
      this.isLoading = true;
      const formValue = this.productForm.value;

      // Get client name for the product
      this.clientService.getClientById(formValue.clientId).subscribe(client => {
        if (!client) {
          this.snackBar.open('Selected client not found', 'Close', { duration: 3000 });
          this.isLoading = false;
          return;
        }

        const productData = {
          ...formValue,
          clientName: client.nameEn,
          recurringStartDate: formValue.recurringStartDate ? 
            new Date(formValue.recurringStartDate) : undefined
        };

        if (this.isEditMode && this.productId) {
          this.productService.updateProduct(this.productId, productData).subscribe(
            (updatedProduct) => {
              this.isLoading = false;
              if (updatedProduct) {
                this.snackBar.open('Product updated successfully', 'Close', { duration: 3000 });
                this.router.navigate(['/products']);
              }
            }
          );
        } else {
          this.productService.createProduct(productData).subscribe(
            (newProduct) => {
              this.isLoading = false;
              this.snackBar.open('Product created successfully', 'Close', { duration: 3000 });
              this.router.navigate(['/products']);
            }
          );
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel() {
    this.router.navigate(['/products']);
  }

  private markFormGroupTouched() {
    Object.keys(this.productForm.controls).forEach(key => {
      const control = this.productForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.productForm.get(fieldName);

    if (control?.hasError('required')) {
      return `${fieldName} is required`;
    }
    if (control?.hasError('minlength')) {
      return `${fieldName} must be at least ${control.errors?.['minlength'].requiredLength} characters`;
    }
    if (control?.hasError('min')) {
      return `${fieldName} must be greater than ${control.errors?.['min'].min}`;
    }
    return '';
  }

  get isRecurring(): boolean {
    return this.productForm.get('isRecurring')?.value || false;
  }
}