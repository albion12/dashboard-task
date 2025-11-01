import { Injectable } from '@angular/core';

export interface Sale {
  id: number;
  amount: number;
  country: string;
  user: string;
  date: string;
}

export interface EngagementPoint {
  date: string;
  activeUsers: number;
  sessions: number;
}

@Injectable({ providedIn: 'root' })
export class DataService {
  // Mock sales data
  private sales: Sale[] = [
    { id: 1, amount: 1200, country: 'USA', user: 'John Smith', date: '2025-01-01' },
    { id: 2, amount: 800, country: 'Canada', user: 'Alice Johnson', date: '2025-01-05' },
    { id: 3, amount: 1500, country: 'UK', user: 'Michael Brown', date: '2025-01-10' },
    { id: 4, amount: 700, country: 'Australia', user: 'Emily Davis', date: '2025-01-12' },
    { id: 5, amount: 950, country: 'Germany', user: 'Oliver Schmidt', date: '2025-01-15' },
  ];

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
    return this.filterByDate(this.sales, from, to);
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
