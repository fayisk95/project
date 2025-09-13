import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrdService, BRD } from '../../services/brd.service';

@Component({
  selector: 'app-brd-list',
  templateUrl: './brd-list.component.html',
  styleUrls: ['./brd-list.component.css']
})
export class BrdListComponent implements OnInit {
  brds: BRD[] = [];
  displayedColumns: string[] = ['projectTitle', 'clientCompany', 'createdAt', 'actions'];
  isLoading = false;

  constructor(
    private brdService: BrdService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadBrds();
  }

  loadBrds() {
    this.isLoading = true;
    this.brdService.getAllBrds().subscribe({
      next: (brds) => {
        this.brds = brds;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading BRDs:', error);
        this.isLoading = false;
        this.snackBar.open('Error loading BRDs', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  viewBrd(id: number) {
    this.router.navigate(['/brds', id]);
  }

  exportPdf(brd: BRD) {
    this.brdService.exportToPdf(brd.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `brd-${brd.quotation?.projectTitle || 'document'}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error exporting PDF:', error);
        this.snackBar.open('Error exporting PDF', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}