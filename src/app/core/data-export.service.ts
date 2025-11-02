import { Injectable } from '@angular/core';
import { Sale } from './models/sale.model';

@Injectable({ providedIn: 'root' })
export class DataExportService {
  exportToCSV(sales: Sale[], filename: string = 'sales.csv') {
    const headers = Object.keys(sales[0]).join(',');
    const rows = sales.map(s => Object.values(s).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.click();
  }
}
