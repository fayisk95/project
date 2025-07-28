import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit {
  @Input() type: 'line' | 'pie' = 'line';

  ngOnInit() {
    // Chart initialization would go here
    // For now, we'll display a placeholder
  }
}