import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService, CompanySettings } from '../../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  settingsForm!: FormGroup;
  isLoading = false;
  selectedFile: File | null = null;
  logoPreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.loadCompanySettings();
  }

  initializeForm() {
    this.settingsForm = this.fb.group({
      companyName: ['brandnbytes', Validators.required],
      logoUrl: [''],
      address: ['', Validators.required],
      taxPercent: [5, [Validators.required, Validators.min(0), Validators.max(100)]],
      termsConditions: ['', Validators.required]
    });
  }

  loadCompanySettings() {
    this.isLoading = true;
    this.adminService.getCompanySettings().subscribe({
      next: (settings) => {
        this.settingsForm.patchValue(settings);
        this.logoPreview = settings.logoUrl;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading settings:', error);
        this.isLoading = false;
        // Use default values if no settings found
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.logoPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.settingsForm.valid) {
      this.isLoading = true;

      // First upload logo if selected
      if (this.selectedFile) {
        this.adminService.uploadLogo(this.selectedFile).subscribe({
          next: (response) => {
            this.settingsForm.patchValue({ logoUrl: response.logoUrl });
            this.saveSettings();
          },
          error: (error) => {
            console.error('Error uploading logo:', error);
            this.isLoading = false;
            this.snackBar.open('Error uploading logo', 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
      } else {
        this.saveSettings();
      }
    }
  }

  private saveSettings() {
    this.adminService.updateCompanySettings(this.settingsForm.value).subscribe({
      next: (settings) => {
        this.isLoading = false;
        this.selectedFile = null;
        this.snackBar.open('Settings updated successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        console.error('Error saving settings:', error);
        this.isLoading = false;
        this.snackBar.open('Error saving settings', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}