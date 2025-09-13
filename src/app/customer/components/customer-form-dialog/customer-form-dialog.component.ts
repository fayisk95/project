import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Customer } from '../../services/customer.service';

@Component({
  selector: 'app-customer-form-dialog',
  templateUrl: './customer-form-dialog.component.html',
  styleUrls: ['./customer-form-dialog.component.css']
})
export class CustomerFormDialogComponent implements OnInit {
  customerForm!: FormGroup;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CustomerFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Customer
  ) {
    this.isEditMode = !!data;
  }

  ngOnInit() {
    this.customerForm = this.fb.group({
      companyName: [this.data?.companyName || '', Validators.required],
      contactName: [this.data?.contactName || '', Validators.required],
      email: [this.data?.email || '', [Validators.required, Validators.email]],
      phone: [this.data?.phone || '', Validators.required],
      address: [this.data?.address || '', Validators.required]
    });
  }

  onSubmit() {
    if (this.customerForm.valid) {
      this.dialogRef.close(this.customerForm.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}