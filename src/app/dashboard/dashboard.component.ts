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
import { ChartConfiguration } from 'chart.js';
import { Subscription } from 'rxjs';
import { FilterBarComponent } from '../shared/filter-bar/filter-bar.component';
import { DashboardStateService } from '../core/dashboard-state.service';
import { DataService } from '../core/data.service';
import { MatInputModule } from '@angular/material/input';
import { DashboardItem } from '../core/models/dashboard-item.model';
import { DataExportService } from '../core/data-export.service';
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

  //  Chart type selectors for each chart widget
  lineChartType: 'line' | 'bar' | 'pie' = 'line';
  barChartType: 'line' | 'bar' | 'pie' = 'bar';

  // Chart data
  lineChartData: ChartConfiguration['data'] = { labels: [], datasets: [] };
  barChartData: ChartConfiguration['data'] = { labels: [], datasets: [] };
  pieChartData: ChartConfiguration['data'] = { labels: [], datasets: [] };

  totalSales = 0;

  // Table setup
  displayedColumns = ['user', 'email', 'country', 'amount', 'date'];
  dataSource = new MatTableDataSource<{ user: string; email: string; country: string; amount: number; date: string }>([]);

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
      itemChangeCallback: () => this.persistLayout(),
      itemResizeCallback: () => this.persistLayout(),
    };

    this.dashboard = this.state.getLayout<DashboardItem[]>([
      { cols: 2, rows: 1, y: 0, x: 0, label: 'Total Sales' },
      { cols: 4, rows: 1, y: 0, x: 2, label: 'Filter Bar' },
      { cols: 2, rows: 2, y: 1, x: 0, label: 'Line Chart' },
      { cols: 2, rows: 2, y: 1, x: 2, label: 'Bar Chart' },
      { cols: 2, rows: 2, y: 1, x: 4, label: 'Table' },
    ]);

    // React to filter changes
    this.sub = this.state.filters$.subscribe((f) => {
      const sales = this.data.getSales(f.from, f.to);
      const engagement = this.data.getEngagement(f.from, f.to);
      this.totalSales = sales.reduce((s, r) => s + r.amount, 0);

      //Line chart data (engagement over time)
      this.lineChartData = {
        labels: engagement.map((e) => e.date),
        datasets: [
          {
            label: 'Active Users',
            data: engagement.map((e) => e.activeUsers),
            fill: true,
            tension: 0.35,
            borderColor: '#42A5F5',
            backgroundColor: 'rgba(66, 165, 245, 0.1)',
          },
        ],
      };

      // Bar chart data (sales by user)
      this.barChartData = {
        labels: sales.map((s) => s.user),
        datasets: [
          {
            label: 'Sales',
            data: sales.map((s) => s.amount),
            backgroundColor: '#42A5F5', // soft blue
            borderColor: '#1E88E5', 
            borderWidth: 1,
          },
        ],
      };

      //  Pie chart data (sales by country)
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
              '#FF6384',
              '#36A2EB',
              '#FFCE56',
              '#4BC0C0',
              '#9966FF',
              '#FF9F40',
              '#FF6384',
              '#C9CBCF',
              '#E7E9ED',
              '#71B37C'
            ],
            borderWidth: 2,
            borderColor: '#fff',
          },
        ],
      };

      // Update table dynamically
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

  //  Get chart options based on chart type
  getChartOptions(type: 'line' | 'bar' | 'pie'): ChartConfiguration['options'] {
    const baseOptions: ChartConfiguration['options'] = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { 
        legend: { 
          display: true,
          position: type === 'pie' ? 'right' : 'top'
        }
      },
    };

    if (type === 'pie') {
      return {
        ...baseOptions,
        scales: undefined, // Pie charts don't use scales
      };
    }

    return {
      ...baseOptions,
      scales: {
        x: { display: true },
        y: { display: true }
      }
    };
  }

  //  Get data for line chart widget based on selected type
  getLineChartData(): ChartConfiguration['data'] {
    switch (this.lineChartType) {
      case 'line':
        return this.lineChartData;
      case 'bar':
        return this.lineChartData;
      case 'pie':
        return this.pieChartData;
      default:
        return this.lineChartData;
    }
  }

  //  Get data for bar chart widget based on selected type
  getBarChartData(): ChartConfiguration['data'] {
    switch (this.barChartType) {
      case 'line':
        return this.barChartData;
      case 'bar':
        return this.barChartData;
      case 'pie':
        return this.pieChartData;
      default:
        return this.barChartData;
    }
  }

  //  Get chart title based on widget and type
  getChartTitle(widget: 'line' | 'bar', type: 'line' | 'bar' | 'pie'): string {
    if (widget === 'line') {
      switch (type) {
        case 'line':
        case 'bar':
          return 'Active Users Over Time';
        case 'pie':
          return 'Sales Distribution by Country';
        default:
          return 'Chart';
      }
    } else {
      switch (type) {
        case 'line':
        case 'bar':
          return 'Sales by User';
        case 'pie':
          return 'Sales Distribution by Country';
        default:
          return 'Chart';
      }
    }
  }

  private persistLayout() {
    this.state.setLayout(this.dashboard);
  }

  exportCSV() {
    this.exportService.exportToCSV(this.sales);
  }
}
