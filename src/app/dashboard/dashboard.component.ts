import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridsterConfig, GridsterModule } from 'angular-gridster2';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { Subscription } from 'rxjs';
import { FilterBarComponent } from '../shared/filter-bar/filter-bar.component';
import { DashboardStateService } from '../core/services/dashboard-state.service';
import { DataService } from '../core/services/data.service';
import { MatInputModule } from '@angular/material/input';
import { DashboardItem } from '../core/models/dashboard-item.model';
import { DataExportService } from '../core/services/data-export.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TableWidgetComponent } from '../table/table-widget.component';

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
    MatTableModule,
    MatPaginatorModule,
    MatInputModule,
    MatSortModule,
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
  sales = this.data.getSales();

  // Chart type selectors
  lineChartType: ChartType = 'line';
  barChartType: ChartType = 'bar';

  // Chart data
  salesOverTimeData: ChartConfiguration['data'] = { labels: [], datasets: [] };
  barChartData: ChartConfiguration['data'] = { labels: [], datasets: [] };
  pieChartData: ChartConfiguration['data'] = { labels: [], datasets: [] };

  totalSales = 0;

  // Table setup
  displayedColumns = ['user', 'email', 'country', 'amount', 'date'];
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    this.options = {
      draggable: { enabled: true },
      resizable: { enabled: true },
      pushItems: true,
      margin: 2,
      displayGrid: 'none',

      minCols: 6,
      minRows: 4,
    };

    this.dashboard = this.state.getLayout<DashboardItem[]>([
      { cols: 2, rows: 1, y: 0, x: 0, label: 'Total Sales' },
      { cols: 4, rows: 1, y: 0, x: 2, label: 'Filter Bar' },
      { cols: 2, rows: 3, y: 1, x: 0, label: 'Total Sales Chart' },
      { cols: 2, rows: 3, y: 1, x: 2, label: 'Chart' },
      { cols: 2, rows: 3, y: 1, x: 4, label: 'Table' },
    ]);

    this.sub = this.state.filters$.subscribe((f) => {
      const sales = this.data.getSales(f.from, f.to);
      this.totalSales = sales.reduce((s, r) => s + r.amount, 0);

         //LINE CHART → total sales over time
      const salesByDate = sales.reduce((acc, s) => {
        acc[s.date] = (acc[s.date] || 0) + s.amount;
        return acc;
      }, {} as Record<string, number>);

      const sortedDates = Object.keys(salesByDate).sort();
      const cumulative = sortedDates.reduce((acc, d, i) => {
        acc.push((acc[i - 1] || 0) + salesByDate[d]);
        return acc;
      }, [] as number[]);

      this.salesOverTimeData = {
        labels: sortedDates,
        datasets: [
          {
            label: 'Total Sales',
            data: cumulative,
            fill: true,
            tension: 0.35,
            borderColor: '#42A5F5',
            backgroundColor: 'rgba(66, 165, 245, 0.12)',
            pointRadius: 2,
            pointHoverRadius: 4,
          },
        ],
      };

     
      this.barChartData = {
        labels: sales.map((s) => s.user),
        datasets: [
          {
            label: 'Sales',
            data: sales.map((s) => s.amount),
            backgroundColor: '#42A5F5',
            borderColor: '#1E88E5',
            borderWidth: 1,
          },
        ],
      };

     
      const salesByCountry = sales.reduce((acc, sale) => {
        acc[sale.country] = (acc[sale.country] || 0) + sale.amount;
        return acc;
      }, {} as Record<string, number>);

      this.pieChartData = {
        labels: Object.keys(salesByCountry),
        datasets: [
          {
            label: 'Sales by Country',
            data: Object.values(salesByCountry),
            backgroundColor: [
              '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
              '#9966FF', '#FF9F40', '#C9CBCF', '#71B37C',
            ],
            borderWidth: 2,
            borderColor: '#fff',
          },
        ],
      };

  
      this.dataSource.data = sales.map((s) => ({
        user: s.user,
        email: `${s.user.replace(/\s+/g, '.').toLowerCase()}@example.com`,
        country: s.country,
        amount: s.amount,
        date: s.date,
      }));
    });

    this.state.setFilters({});
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  // Chart options
  getChartOptions(type: ChartType): ChartConfiguration['options'] {
    const base: ChartConfiguration['options'] = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: type === 'pie' ? 'right' : 'top',
        },
      },
    };

    if (type === 'pie') {
      return { ...base };
    }

    return {
      ...base,
      scales: {
        x: { display: true },
        y: { display: true },
      },
    };
  }

  getLineChartData(): ChartConfiguration['data'] {
    return this.lineChartType === 'pie' ? this.pieChartData : this.salesOverTimeData;
  }

  getBarChartData(): ChartConfiguration['data'] {
    return this.barChartType === 'pie' ? this.pieChartData : this.barChartData;
  }

  getChartTitle(widget: 'line' | 'bar', type: ChartType): string {
    if (widget === 'line') {
      return type === 'pie' ? 'Sales Distribution by Country' : 'Total Sales Over Time';
    }
    return type === 'pie' ? 'Sales Distribution by Country' : 'Sales by User';
  }

  private persistLayout() {
    this.state.setLayout(this.dashboard);
  }

  exportCSV() {
    this.exportService.exportToCSV(this.sales);
  }
  saveLayout() {
  this.state.setLayout(this.dashboard);
}

resetLayout() {
  localStorage.removeItem('dashboard_layout_v1');
  this.dashboard = this.state.getLayout<DashboardItem[]>([
    { cols: 2, rows: 1, y: 0, x: 0, label: 'Total Sales' },
    { cols: 4, rows: 1, y: 0, x: 2, label: 'Filter Bar' },
    { cols: 2, rows: 3, y: 1, x: 0, label: 'Total Sales Chart' },
    { cols: 2, rows: 3, y: 1, x: 2, label: 'Chart' },
    { cols: 2, rows: 3, y: 1, x: 4, label: 'Table' },
  ]);
}
}