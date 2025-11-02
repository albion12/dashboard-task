import { Component, Input, ViewChild, AfterViewInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-table-widget',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatSortModule, MatInputModule, MatFormFieldModule],
  templateUrl: './table-widget.component.html',
  styleUrls: ['./table-widget.component.scss'],
})
export class TableWidgetComponent implements AfterViewInit, OnChanges {
  @Input() sales: any[] = [];

  displayedColumns = ['user', 'email', 'country', 'amount', 'date'];
  dataSource = new MatTableDataSource<any>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnChanges() {
    this.dataSource.data = this.sales.map((s) => ({
      user: s.user,
      email: `${s.user.replace(/\s+/g, '.').toLowerCase()}@example.com`,
      country: s.country,
      amount: s.amount,
      date: s.date,
    }));
  }
}
