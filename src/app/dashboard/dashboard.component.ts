import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ViewChildren,
  QueryList,
  HostListener,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridsterConfig, GridsterModule, GridType, CompactType } from 'angular-gridster2';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';

import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';

import { combineLatest, Subscription } from 'rxjs';

import { FilterBarComponent } from '../shared/filter-bar/filter-bar.component';
import { TableWidgetComponent } from '../table/table-widget.component';

import { DashboardItem } from '../core/models/dashboard-item.model';
import { DashboardStateService } from '../core/services/dashboard-state.service';
import { DataService, SalesApiRow } from '../core/services/data.service';
import { DataExportService } from '../core/services/data-export.service';

type Filters = { from?: string; to?: string };

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    GridsterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    BaseChartDirective,
    FilterBarComponent,
    TableWidgetComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  private state = inject(DashboardStateService);
  private data = inject(DataService);
  private exportService = inject(DataExportService);

  private sub?: Subscription;

  options!: GridsterConfig;
  dashboard: DashboardItem[] = [];

  // chart selectors (pie removed because backend doesn't have country/user breakdown)
  lineChartType: ChartType = 'line';
  barChartType: ChartType = 'bar';

  salesOverTimeData: ChartConfiguration['data'] = { labels: [], datasets: [] };
  barChartData: ChartConfiguration['data'] = { labels: [], datasets: [] };

  totalSales = 0;

  // raw rows for table widget
  tableRows: SalesApiRow[] = [];

  @ViewChildren(BaseChartDirective) charts!: QueryList<BaseChartDirective>;

  ngOnInit(): void {
    this.options = {
      gridType: GridType.Fit,
      compactType: CompactType.None,
      margin: 12,
      outerMargin: true,
      outerMarginTop: 0,
      outerMarginRight: 0,
      outerMarginBottom: 0,
      outerMarginLeft: 0,
      rowHeight: 80,
      minCols: 4,
      maxCols: 12,
      minRows: 4,
      pushItems: true,
      swap: true,
      disableScrollVertical: true,
      disableScrollHorizontal: true,
      mobileBreakpoint: 768,
      draggable: {
        enabled: true,
        ignoreContentClass: 'widget-no-drag',
        dragHandleClass: 'widget-drag-handle',
        stop: this.onItemResizeStop.bind(this),
      },
      resizable: {
        enabled: true,
        handles: {
          s: true,
          e: true,
          n: false,
          w: false,
          se: true,
          ne: false,
          sw: false,
          nw: false,
        },
        stop: this.onItemResizeStop.bind(this),
      },
      displayGrid: 'onDrag&Resize',
      itemResizeCallback: this.onItemResize.bind(this),
      itemResizeStopCallback: this.onItemResizeStop.bind(this),
    };

    this.dashboard = this.state.getLayout<DashboardItem[]>([
      { cols: 2, rows: 1, y: 0, x: 0, label: 'Total Sales' },
      { cols: 4, rows: 1, y: 0, x: 2, label: 'Filter Bar' },
      { cols: 3, rows: 3, y: 1, x: 0, label: 'Total Sales Chart' },
      { cols: 3, rows: 3, y: 1, x: 3, label: 'Chart' },
      { cols: 6, rows: 3, y: 4, x: 0, label: 'Table' },
    ]);

    // ensure filters emits at least once
    this.state.setFilters({});

    this.sub = combineLatest([this.state.filters$, this.data.rows$]).subscribe(
      ([filters, rows]) => {
        const filtered = this.applyDateFilter(rows, filters);

        // keep raw rows for the table widget
        this.tableRows = filtered;

        // Total Sales = sum of "total"
        this.totalSales = filtered.reduce((sum, r) => sum + this.toNumber(r.total), 0);

        // Sort by date (YYYY-MM-DD)
        const sorted = [...filtered].sort(
          (a, b) => this.toYmd(a.date).localeCompare(this.toYmd(b.date))
        );

        const labels = sorted.map(r => this.toYmd(r.date));
        const values = sorted.map(r => this.toNumber(r.total));

        // Line chart: daily totals over time
        this.salesOverTimeData = {
          labels,
          datasets: [
            {
              label: 'Daily Total',
              data: values,
              fill: true,
              tension: 0.35,
              borderColor: '#42A5F5',
              backgroundColor: 'rgba(66, 165, 245, 0.12)',
              pointRadius: 2,
              pointHoverRadius: 4,
            },
          ],
        };

        // Bar chart: daily totals
        this.barChartData = {
          labels,
          datasets: [
            {
              label: 'Daily Total',
              data: values,
              backgroundColor: '#42A5F5',
              borderColor: '#1E88E5',
              borderWidth: 1,
            },
          ],
        };

        this.refreshCharts();
      }
    );
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (this.options?.api?.resize) {
      this.options.api.resize();
    }
  }

  private applyDateFilter(rows: SalesApiRow[], f: Filters): SalesApiRow[] {
    if (!f?.from || !f?.to) return rows;

    const from = new Date(f.from);
    const to = new Date(f.to);

    return rows.filter(r => {
      const d = new Date(r.date);
      return d >= from && d <= to;
    });
  }

  private toNumber(v: unknown): number {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  private toYmd(v: unknown): string {
    const d = new Date(String(v ?? ''));
    return !isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : '';
  }

  getChartOptions(type: ChartType): ChartConfiguration['options'] {
    const base: ChartConfiguration['options'] = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: true, position: 'top' } },
    };

    if (type === 'line' || type === 'bar') {
      return { ...base, scales: { x: { display: true }, y: { display: true } } };
    }
    return base;
  }

  getLineChartData(): ChartConfiguration['data'] {
    return this.salesOverTimeData;
  }

  getBarChartData(): ChartConfiguration['data'] {
    return this.barChartData;
  }

  getChartTitle(widget: 'line' | 'bar', _type: ChartType): string {
    return widget === 'line' ? 'Daily Sales Over Time' : 'Daily Sales';
  }

  getWidgetIcon(label: string): string {
    const iconMap: Record<string, string> = {
      'Total Sales': 'attach_money',
      'Filter Bar': 'filter_list',
      'Total Sales Chart': 'show_chart',
      'Chart': 'bar_chart',
      'Table': 'table_chart',
    };
    return iconMap[label] || 'dashboard';
  }

  exportCSV(): void {
    // exports raw backend rows exactly as received (filtered)
    // this.exportService.exportToCSV(this.tableRows);
  }

  saveLayout(): void {
    this.state.setLayout(this.dashboard);
  }

  resetLayout(): void {
    localStorage.removeItem('dashboard_layout_v1');
    this.dashboard = [
      { cols: 2, rows: 1, y: 0, x: 0, label: 'Total Sales' },
      { cols: 4, rows: 1, y: 0, x: 2, label: 'Filter Bar' },
      { cols: 3, rows: 3, y: 1, x: 0, label: 'Total Sales Chart' },
      { cols: 3, rows: 3, y: 1, x: 3, label: 'Chart' },
      { cols: 6, rows: 3, y: 4, x: 0, label: 'Table' },
    ];

    setTimeout(() => {
      this.options.api?.optionsChanged?.();
      this.options.api?.resize?.();
    });
  }

  refreshCharts(): void {
    if (!this.charts) return;
    this.charts.forEach(c => {
      c.chart?.resize();
      c.update();
    });
  }

  onItemResize(): void {
    this.refreshCharts();
  }

  onItemResizeStop(): void {
    this.refreshCharts();
  }
}
