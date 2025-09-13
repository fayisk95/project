import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { QuotationModule } from '../../services/quotation.service';

@Component({
  selector: 'app-module-dialog',
  templateUrl: './module-dialog.component.html',
  styleUrls: ['./module-dialog.component.css']
})
export class ModuleDialogComponent implements OnInit {
  moduleForm!: FormGroup;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ModuleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: QuotationModule
  ) {
    this.isEditMode = !!data;
  }

  ngOnInit() {
    this.moduleForm = this.fb.group({
      name: [this.data?.name || '', Validators.required],
      description: [this.data?.description || '', Validators.required],
      hours: [this.data?.hours || 0, [Validators.required, Validators.min(1)]],
      cost: [this.data?.cost || 0, [Validators.required, Validators.min(0)]]
    });

    // Auto-calculate cost based on hours (assuming $50/hour)
    this.moduleForm.get('hours')?.valueChanges.subscribe(hours => {
      if (hours && hours > 0) {
        const cost = hours * 50; // Default rate
        this.moduleForm.patchValue({ cost }, { emitEvent: false });
      }
    });
  }

  onSubmit() {
    if (this.moduleForm.valid) {
      this.dialogRef.close(this.moduleForm.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}