import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

interface ResponseRow {
  id: string;
  submittedAt: Date;
  [key: string]: unknown;
}

@Component({
  standalone: false,
  selector: 'app-response-table',
  templateUrl: './response-table.component.html',
  styleUrls: ['./response-table.component.scss'],
})
export class ResponseTableComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  @Input() set responses(value: ResponseRow[]) {
    this.dataSource.data = value;
  }

  @Input() columns: { key: string; label: string }[] = [];
  @Output() deleted = new EventEmitter<string>();

  dataSource = new MatTableDataSource<ResponseRow>([]);
  selectedResponse: ResponseRow | null = null;
  showDetailPanel = false;

  get displayedColumns(): string[] {
    return ['submittedAt', ...this.columns.map((c) => c.key), 'actions'];
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  formatValue(value: unknown): string {
    if (value === null || value === undefined) return '-';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString();
  }

  viewDetails(row: ResponseRow): void {
    this.selectedResponse = row;
    this.showDetailPanel = true;
  }

  closeDetails(): void {
    this.showDetailPanel = false;
    this.selectedResponse = null;
  }

  deleteResponse(row: ResponseRow): void {
    if (confirm('Are you sure you want to delete this response?')) {
      this.deleted.emit(row.id);
    }
  }

  exportCsv(): void {
    if (this.dataSource.data.length === 0) return;

    const headers = ['Submitted At', ...this.columns.map((c) => c.label)];
    const rows = this.dataSource.data.map((row) => [
      this.formatDate(row.submittedAt),
      ...this.columns.map((c) => this.formatValue(row[c.key])),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((r) => r.map((v) => `"${v}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `responses-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
