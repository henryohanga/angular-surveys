import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ElementRef,
  ViewChild,
} from '@angular/core';

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

@Component({ standalone: false,
  selector: 'app-response-chart',
  templateUrl: './response-chart.component.html',
  styleUrls: ['./response-chart.component.scss'],
})
export class ResponseChartComponent implements OnChanges {
  @ViewChild('chartContainer') chartContainer!: ElementRef;

  @Input() data: ChartData[] = [];
  @Input() type: 'bar' | 'pie' | 'donut' = 'bar';
  @Input() title = '';
  @Input() height = 300;

  maxValue = 0;
  total = 0;

  // Default colors
  colors = [
    '#667eea',
    '#764ba2',
    '#f093fb',
    '#f5576c',
    '#4facfe',
    '#00f2fe',
    '#43e97b',
    '#38f9d7',
    '#fa709a',
    '#fee140',
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.calculateStats();
    }
  }

  private calculateStats(): void {
    if (this.data.length === 0) {
      this.maxValue = 0;
      this.total = 0;
      return;
    }

    this.maxValue = Math.max(...this.data.map((d) => d.value));
    this.total = this.data.reduce((sum, d) => sum + d.value, 0);
  }

  getPercentage(value: number): number {
    if (this.total === 0) return 0;
    return Math.round((value / this.total) * 100);
  }

  getBarWidth(value: number): number {
    if (this.maxValue === 0) return 0;
    return (value / this.maxValue) * 100;
  }

  getColor(index: number, item?: ChartData): string {
    if (item?.color) return item.color;
    return this.colors[index % this.colors.length];
  }

  // For pie/donut charts
  getPieSliceStyle(index: number): Record<string, string> {
    if (this.total === 0) return {};

    let startAngle = 0;
    for (let i = 0; i < index; i++) {
      startAngle += (this.data[i].value / this.total) * 360;
    }

    const angle = (this.data[index].value / this.total) * 360;

    return {
      '--start-angle': `${startAngle}deg`,
      '--angle': `${angle}deg`,
      '--color': this.getColor(index, this.data[index]),
    };
  }
}
