import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridsterConfig, GridsterItem, GridsterModule } from 'angular-gridster2';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';

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
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  options!: GridsterConfig;
  dashboard: DashboardItem[] = [];

  // Chart.js data
  lineChartData: ChartConfiguration['data'] = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue',
        data: [1500, 2200, 1800, 2400, 2800, 3500],
        borderColor: '#3f51b5',
        backgroundColor: 'rgba(63,81,181,0.3)',
        fill: true,
        tension: 0.4,
      },
    ],
  };
  barChartData: ChartConfiguration['data'] = {
    labels: ['USA', 'Canada', 'UK', 'Germany', 'Australia'],
    datasets: [
      {
        label: 'Sales',
        data: [1200, 800, 1500, 1100, 900],
        backgroundColor: '#673ab7',
      },
    ],
  };
  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true } },
  };

  ngOnInit() {
    this.options = {
      draggable: { enabled: true },
      resizable: { enabled: true },
      pushItems: true,
      displayGrid: 'onDrag&Resize',
      minCols: 6,
      minRows: 4,
      margin: 10,
    };

    this.dashboard = [
      { cols: 2, rows: 1, y: 0, x: 0, label: 'Total Sales' },
      { cols: 2, rows: 2, y: 1, x: 0, label: 'Line Chart' },
      { cols: 2, rows: 2, y: 0, x: 2, label: 'Bar Chart' },
      { cols: 2, rows: 2, y: 2, x: 2, label: 'Table' },
    ];
  }

  saveLayout() {
    localStorage.setItem('dashboard-layout', JSON.stringify(this.dashboard));
  }
}
