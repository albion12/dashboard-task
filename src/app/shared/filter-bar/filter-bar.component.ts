import { Component, inject } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { DashboardStateService } from '../../core/dashboard-state.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatInputModule,
    MatButtonModule,
    MatNativeDateModule,
    FormsModule
  ],
  templateUrl: './filter-bar.component.html',
  styleUrls: ['./filter-bar.component.scss'],
})
export class FilterBarComponent {
  private state = inject(DashboardStateService);

  datasets = ['Sales', 'Engagement', 'Revenue'];
  selectedDataset = this.datasets[0];
  selectedRange = 'last90';

  startDate: Date | null = null;
  endDate: Date | null = null;

  // Apply manually chosen date range
  apply() {
    const payload: any = {};
    if (this.startDate) payload.from = this.startDate.toISOString().slice(0, 10);
    if (this.endDate)   payload.to   = this.endDate.toISOString().slice(0, 10);

    this.state.setFilters(payload);          
    this.selectedRange = '';                 
  }

  // Quick range button (e.g. Last 90 Days)
  setQuickRange(type: string) {
    const to = new Date();
    const from = new Date();
    if (type === 'last90') from.setDate(to.getDate() - 90);
    if (type === 'last30') from.setDate(to.getDate() - 30);
    this.state.setFilters({
      from: from.toISOString().slice(0, 10),
      to:   to.toISOString().slice(0, 10),
    });

    this.selectedRange = type;
    // Reset manual pickers
    this.startDate = from;
    this.endDate   = to;
  }

  clear() {
    this.state.setFilters({});
    this.selectedRange = '';
    this.startDate = null;
    this.endDate   = null;
  }
}