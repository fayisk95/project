import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Client, ClientService } from '../services/client.service';

@Component({
  selector: 'app-client-form',
  templateUrl: './client-form.component.html',
  styleUrls: ['./client-form.component.scss']
})
export class ClientFormComponent implements OnInit {
  clientForm!: FormGroup;
  isEditMode = false;
  clientId?: string;
  isLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.checkEditMode();
  }

  initializeForm() {
    this.clientForm = this.formBuilder.group({
      nameEn: ['', [Validators.required, Validators.minLength(2)]],
      nameAr: [''],
      address: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contactNumber: ['', Validators.required],
      whatsappNumber: ['', Validators.required],
      poc: this.formBuilder.group({
        contactNumber: ['', Validators.required],
        whatsappNumber: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]]
      }),
      hostingPlatform: this.formBuilder.group({
        name: ['', Validators.required],
        accountDetails: ['', Validators.required]
      }),
      totalOutstanding: [0, [Validators.min(0)]]
    });
  }

  checkEditMode() {
    this.clientId = this.route.snapshot.paramMap.get('id') || undefined;
    this.isEditMode = !!this.clientId;

    if (this.isEditMode && this.clientId) {
      this.loadClient(this.clientId);
    }
  }

  loadClient(id: string) {
    this.isLoading = true;
    this.clientService.getClientById(id).subscribe(client => {
      this.isLoading = false;
      if (client) {
        this.clientForm.patchValue(client);
      } else {
        this.snackBar.open('Client not found', 'Close', { duration: 3000 });
        this.router.navigate(['/clients']);
      }
    });
  }

  onSubmit() {
    if (this.clientForm.valid) {
      this.isLoading = true;
      const formValue = this.clientForm.value;

      if (this.isEditMode && this.clientId) {
        this.clientService.updateClient(this.clientId, formValue).subscribe(
          (updatedClient) => {
            this.isLoading = false;
            if (updatedClient) {
              this.snackBar.open('Client updated successfully', 'Close', { duration: 3000 });
              this.router.navigate(['/clients']);
            }
          }
        );
      } else {
        this.clientService.createClient(formValue).subscribe(
          (newClient) => {
            this.isLoading = false;
            this.snackBar.open('Client created successfully', 'Close', { duration: 3000 });
            this.router.navigate(['/clients']);
          }
        );
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel() {
    this.router.navigate(['/clients']);
  }

  private markFormGroupTouched() {
    Object.keys(this.clientForm.controls).forEach(key => {
      const control = this.clientForm.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        Object.keys(control.controls).forEach(nestedKey => {
          control.get(nestedKey)?.markAsTouched();
        });
      }
    });
  }

  getErrorMessage(fieldName: string, nestedGroup?: string): string {
    const control = nestedGroup 
      ? this.clientForm.get(nestedGroup)?.get(fieldName)
      : this.clientForm.get(fieldName);

    if (control?.hasError('required')) {
      return `${fieldName} is required`;
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email';
    }
    if (control?.hasError('minlength')) {
      return `${fieldName} must be at least ${control.errors?.['minlength'].requiredLength} characters`;
    }
    if (control?.hasError('min')) {
      return `${fieldName} must be greater than or equal to ${control.errors?.['min'].min}`;
    }
    return '';
  }
}