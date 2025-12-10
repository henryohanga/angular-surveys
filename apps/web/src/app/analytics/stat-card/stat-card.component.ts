import { Component, Input } from '@angular/core';

@Component({ standalone: false,
  selector: 'app-stat-card',
  templateUrl: './stat-card.component.html',
  styleUrls: ['./stat-card.component.scss'],
})
export class StatCardComponent {
  @Input() title = '';
  @Input() value: string | number = 0;
  @Input() icon = 'analytics';
  @Input() color: 'primary' | 'accent' | 'warn' | 'success' = 'primary';
  @Input() subtitle?: string;
  @Input() trend?: number;
  @Input() trendLabel?: string;
}
