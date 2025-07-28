import { Component, Input } from '@angular/core';
import { KpiData } from '../../dashboard.component';

@Component({
  selector: 'app-kpi-card',
  templateUrl: './kpi-card.component.html',
  styleUrls: ['./kpi-card.component.scss']
})
export class KpiCardComponent {
  @Input() data!: KpiData;

  get formattedValue(): string {
    if (this.data.title.includes('Dues')) {
      return `$${this.data.value.toLocaleString()}`;
    }
    return this.data.value.toString();
  }

  get trendIcon(): string {
    return this.data.trend === 'up' ? 'trending_up' : 
           this.data.trend === 'down' ? 'trending_down' : 'trending_flat';
  }

  get trendClass(): string {
    return `trend-${this.data.trend}`;
  }
}