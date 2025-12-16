// core/services/data.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { BehaviorSubject } from 'rxjs';

export type SalesApiRow = {
  _id: string;
  date: string;       // ISO string
  total: number;      // daily total
  items: any[];       // details array (currently empty in your data)
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
};

type PagedResponse<T> = { rows: T[]; total: number; page: number; pageSize: number };

@Injectable({ providedIn: 'root' })
export class DataService {
  private rowsSubject = new BehaviorSubject<SalesApiRow[]>([]);
  rows$ = this.rowsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.fetchFromApi();
  }

  private fetchFromApi(): void {
    const params = new HttpParams().set('pageSize', '1000');

    this.http
      .get<PagedResponse<SalesApiRow>>(`${environment.apiBaseUrl}/sales`, { params })
      .subscribe({
        next: (res) => {
          const rows = res?.rows ?? [];
          this.rowsSubject.next(rows);
        },
        error: (err) => console.error('Failed to load sales from API', err),
      });
  }

  refresh(): void {
    this.fetchFromApi();
  }
}
