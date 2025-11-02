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
    BaseChartDirective,
    FilterBarComponent,
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

  // ✅ Chart type selector
  chartType: 'line' | 'bar' | 'pie' = 'line';

  lineChartData: ChartConfiguration['data'] = { labels: [], datasets: [] };
  barChartData: ChartConfiguration['data'] = { labels: [], datasets: [] };
  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true } },
  };

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
      { cols: 2, rows: 2, y: 0, x: 2, label: 'Bar Chart' },
      { cols: 2, rows: 2, y: 2, x: 2, label: 'Table' },
    ]);

    // React to filter changes
    this.sub = this.state.filters$.subscribe((f) => {
      const sales = this.data.getSales(f.from, f.to);
      const engagement = this.data.getEngagement(f.from, f.to);

      this.totalSales = sales.reduce((s, r) => s + r.amount, 0);

      this.lineChartData = {
        labels: engagement.map((e) => e.date),
        datasets: [
          {
            label: 'Active Users',
            data: engagement.map((e) => e.activeUsers),
            fill: true,
            tension: 0.35,
          },
        ],
      };

      this.barChartData = {
        labels: sales.map((s) => s.user),
        datasets: [
          {
            label: 'Sales',
            data: sales.map((s) => s.amount),
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

  // saveLayout() {
  //   this.persistLayout();
  // }

  private persistLayout() {
    this.state.setLayout(this.dashboard);
  }

  exportCSV() {
    this.exportService.exportToCSV(this.sales);
  }

  
}
