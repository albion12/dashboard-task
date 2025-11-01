import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridsterConfig, GridsterItem, GridsterModule } from 'angular-gridster2';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { Subscription } from 'rxjs';
import { FilterBarComponent } from '../shared/filter-bar/filter-bar.component';
import { DashboardStateService } from '../core/dashboard-state.service';
import { DataService } from '../core/data.service';

interface DashboardItem extends GridsterItem {
  label: string;
}

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
    BaseChartDirective,
    FilterBarComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private state = inject(DashboardStateService);
  private data = inject(DataService);
  private sub?: Subscription;

  options!: GridsterConfig;
  dashboard: DashboardItem[] = [];

  lineChartData: ChartConfiguration['data'] = { labels: [], datasets: [] };
  barChartData: ChartConfiguration['data'] = { labels: [], datasets: [] };
  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true } },
  };

  totalSales = 0;

  ngOnInit() {
    this.options = {
      draggable: { enabled: true },
      resizable: { enabled: true },
      pushItems: true,
      displayGrid: 'onDrag&Resize',
      minCols: 6,
      minRows: 4,
      margin: 16,
      itemChangeCallback: () => this.persistLayout(),
      itemResizeCallback: () => this.persistLayout(),
    };

    this.dashboard = [
      { cols: 2, rows: 1, y: 0, x: 0, label: 'Total Sales' },
      { cols: 4, rows: 1, y: 0, x: 2, label: 'Filter Bar' }, 
      { cols: 2, rows: 2, y: 1, x: 0, label: 'Line Chart' },
      { cols: 2, rows: 2, y: 0, x: 2, label: 'Bar Chart' },
      { cols: 2, rows: 2, y: 2, x: 2, label: 'Table' },
    ];

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
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  saveLayout() {
  console.log('Saving layout:', this.dashboard);
  this.persistLayout();
}

  private persistLayout() {
    this.state.setLayout(this.dashboard);
  }
}
