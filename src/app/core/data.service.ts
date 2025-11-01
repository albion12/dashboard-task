import { Injectable } from '@angular/core';
import { Sale } from './models/sale.model';
import { EngagementPoint } from './models/engagement.model';
import { MOCK_SALES } from './data/mock-sales';

@Injectable({ providedIn: 'root' })
export class DataService {

  private sales: Sale[] = MOCK_SALES;

  // Mock engagement data (randomized for realism)
  private engagement: EngagementPoint[] = Array.from({ length: 30 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (30 - i));
    return {
      date: date.toISOString().slice(0, 10),
      activeUsers: 1000 + Math.round(Math.random() * 400),
      sessions: 2000 + Math.round(Math.random() * 800),
    };
  });

  constructor() {}

  // Returns filtered sales
  getSales(from?: string, to?: string): Sale[] {
  if (!from || !to) return this.sales;

  const fromDate = new Date(from);
  const toDate = new Date(to);

  return this.sales.filter(sale => {
    const saleDate = new Date(sale.date);
    return saleDate >= fromDate && saleDate <= toDate;
  });
}



  // Returns filtered engagement data
  getEngagement(from?: string, to?: string): EngagementPoint[] {
    return this.filterByDate(this.engagement, from, to);
  }

  // Helper: filters arrays by date
  private filterByDate<T extends { date: string }>(
    data: T[],
    from?: string,
    to?: string
  ): T[] {
    return data.filter(
      (item) =>
        (!from || item.date >= from) &&
        (!to || item.date <= to)
    );
  }
}
