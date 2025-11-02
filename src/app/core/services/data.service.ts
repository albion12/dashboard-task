import { Injectable } from '@angular/core';
import { Sale } from '../models/sale.model';
import { MOCK_SALES } from '../data/mock-sales';

@Injectable({ providedIn: 'root' })
export class DataService {

  private sales: Sale[] = MOCK_SALES;

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

}
