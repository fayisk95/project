import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomerService, Customer } from '../../services/customer.service';
import { CustomerFormDialogComponent } from '../customer-form-dialog/customer-form-dialog.component';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.css']
})
export class CustomerListComponent implements OnInit {
  customers: Customer[] = [];
  displayedColumns: string[] = ['companyName', 'contactName', 'email', 'phone', 'createdAt', 'actions'];
  isLoading = false;

  constructor(
    private customerService: CustomerService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers() {
    this.isLoading = true;
    this.customerService.getAllCustomers().subscribe({
      next: (customers) => {
        this.customers = customers;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading customers:', error);
        this.isLoading = false;
        this.snackBar.open('Error loading customers', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  addCustomer() {
    const dialogRef = this.dialog.open(CustomerFormDialogComponent, {
      width: '600px',
      data: null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.customerService.createCustomer(result).subscribe({
          next: () => {
            this.snackBar.open('Customer created successfully!', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.loadCustomers();
          },
          error: (error) => {
            console.error('Error creating customer:', error);
            this.snackBar.open('Error creating customer', 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }

  editCustomer(customer: Customer) {
    const dialogRef = this.dialog.open(CustomerFormDialogComponent, {
      width: '600px',
      data: customer
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && customer.id) {
        this.customerService.updateCustomer(customer.id, result).subscribe({
          next: () => {
            this.snackBar.open('Customer updated successfully!', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.loadCustomers();
          },
          error: (error) => {
            console.error('Error updating customer:', error);
            this.snackBar.open('Error updating customer', 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }

  deleteCustomer(customer: Customer) {
    if (confirm('Are you sure you want to delete this customer?') && customer.id) {
      this.customerService.deleteCustomer(customer.id).subscribe({
        next: () => {
          this.snackBar.open('Customer deleted successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadCustomers();
        },
        error: (error) => {
          console.error('Error deleting customer:', error);
          this.snackBar.open('Error deleting customer', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }
}