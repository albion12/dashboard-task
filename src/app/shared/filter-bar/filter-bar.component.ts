import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { DashboardStateService } from '../../core/services/dashboard-state.service';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatInputModule,
    MatButtonModule,
    MatNativeDateModule
  ],
  templateUrl: './filter-bar.component.html',
  styleUrls: ['./filter-bar.component.scss'],
})
export class FilterBarComponent {
  private state = inject(DashboardStateService);

  datasets = ['Sales', 'Revenue'];
  selectedDataset = this.datasets[0];
  selectedRange = '';

  startDate: Date | null = null;
  endDate: Date | null = null;

  //Handles dropdown changes (last 7, 30, 90 days)
  onRangeChange(range: string) {
    if (!range) return; // custom mode

    const to = new Date();
    const from = new Date();

    if (range === 'last7') from.setDate(to.getDate() - 7);
    if (range === 'last30') from.setDate(to.getDate() - 30);
    if (range === 'last90') from.setDate(to.getDate() - 90);

    this.startDate = from;
    this.endDate = to;

    this.emitFilters(from, to);
  }

  // Called automatically when either date changes
  onDateChange() {
    if (this.startDate && this.endDate) {
      this.selectedRange = ''; // custom override
      this.emitFilters(this.startDate, this.endDate);
    }
  }

  // Sends new filter state to Dashboard
  private emitFilters(from: Date, to: Date) {
    this.state.setFilters({
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10),
    });
  }

  clear() {
    this.startDate = null;
    this.endDate = null;
    this.selectedRange = '';
    this.state.setFilters({});
  }
}
