import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AdditionalCharge } from '../../services/quotation.service';

@Component({
  selector: 'app-additional-charges-dialog',
  templateUrl: './additional-charges-dialog.component.html',
  styleUrls: ['./additional-charges-dialog.component.css']
})
export class AdditionalChargesDialogComponent implements OnInit {
  chargeForm!: FormGroup;
  isEditMode = false;

  predefinedCharges = [
    { name: 'Domain Registration', unitCost: 15 },
    { name: 'SSL Certificate', unitCost: 50 },
    { name: 'Web Hosting (Annual)', unitCost: 120 },
    { name: 'Email Hosting', unitCost: 60 },
    { name: 'Third-party API Integration', unitCost: 200 },
    { name: 'Maintenance & Support (Monthly)', unitCost: 300 },
    { name: 'Training Session', unitCost: 500 },
    { name: 'Content Migration', unitCost: 800 }
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AdditionalChargesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AdditionalCharge
  ) {
    this.isEditMode = !!data;
  }

  ngOnInit() {
    this.chargeForm = this.fb.group({
      name: [this.data?.name || '', Validators.required],
      unitCost: [this.data?.unitCost || 0, [Validators.required, Validators.min(0)]],
      quantity: [this.data?.quantity || 1, [Validators.required, Validators.min(1)]],
      total: [{ value: this.data?.total || 0, disabled: true }]
    });

    // Auto-calculate total
    this.chargeForm.get('unitCost')?.valueChanges.subscribe(() => this.calculateTotal());
    this.chargeForm.get('quantity')?.valueChanges.subscribe(() => this.calculateTotal());

    // Calculate initial total
    this.calculateTotal();
  }

  calculateTotal() {
    const unitCost = this.chargeForm.get('unitCost')?.value || 0;
    const quantity = this.chargeForm.get('quantity')?.value || 0;
    const total = unitCost * quantity;
    this.chargeForm.patchValue({ total }, { emitEvent: false });
  }

  selectPredefinedCharge(charge: any) {
    this.chargeForm.patchValue({
      name: charge.name,
      unitCost: charge.unitCost,
      quantity: 1
    });
  }

  onSubmit() {
    if (this.chargeForm.valid) {
      const formValue = this.chargeForm.getRawValue(); // Get all values including disabled ones
      this.dialogRef.close(formValue);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}