import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DateRanges } from '../models/filters.model';

@Injectable({ providedIn: 'root' })
export class DashboardStateService {
  private FILTERS_KEY = 'dashboard_filters_v1';
  private LAYOUT_KEY = 'dashboard_layout_v1';

  private _filters = new BehaviorSubject<DateRanges>(
    this.getFromLocalStorage<DateRanges>(this.FILTERS_KEY, {})
  );
  filters$ = this._filters.asObservable();

  setFilters(filters: DateRanges) {
    this._filters.next({ ...filters });
    localStorage.setItem(this.FILTERS_KEY, JSON.stringify(filters));
  }
  getFilters(): DateRanges {
    return this._filters.value;
  }

  setLayout<T>(layout: T) {
    localStorage.setItem(this.LAYOUT_KEY, JSON.stringify(layout));
  }

  getLayout<T>(fallback: T): T {
    return this.getFromLocalStorage<T>(this.LAYOUT_KEY, fallback);
  }

  private getFromLocalStorage<T>(key: string, fallback: T): T {
    try {
      const val = localStorage.getItem(key);
      return val ? (JSON.parse(val) as T) : fallback;
    } catch {
      return fallback;
    }
  }
}
