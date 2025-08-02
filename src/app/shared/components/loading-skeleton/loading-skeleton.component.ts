import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-skeleton',
  templateUrl: './loading-skeleton.component.html',
  styleUrls: ['./loading-skeleton.component.scss']
})
export class LoadingSkeletonComponent {
  @Input() type: 'text' | 'card' | 'table' | 'list' = 'text';
  @Input() lines: number = 3;
  @Input() height: string = '20px';
  @Input() width: string = '100%';

  get skeletonLines(): number[] {
    return Array(this.lines).fill(0).map((_, i) => i);
  }
}