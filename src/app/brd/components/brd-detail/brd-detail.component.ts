import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrdService, BRD } from '../../services/brd.service';

@Component({
  selector: 'app-brd-detail',
  templateUrl: './brd-detail.component.html',
  styleUrls: ['./brd-detail.component.css']
})
export class BrdDetailComponent implements OnInit {
  brd: BRD | null = null;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private brdService: BrdService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadBrd(+id);
    }
  }

  loadBrd(id: number) {
    this.isLoading = true;
    this.brdService.getBrdById(id).subscribe({
      next: (brd) => {
        this.brd = brd;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading BRD:', error);
        this.isLoading = false;
        this.snackBar.open('Error loading BRD', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  exportPdf() {
    if (this.brd?.id) {
      this.brdService.exportToPdf(this.brd.id).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `brd-${this.brd?.quotation?.projectTitle || 'document'}.pdf`;
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

  backToList() {
    this.router.navigate(['/brds']);
  }
}