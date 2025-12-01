import { Injectable } from '@angular/core';

/**
 * Utility service for client-side report exports.
 */
@Injectable({ providedIn: 'root' })
export class ReportService {

  /**
   * Export an array of objects to a CSV file and trigger the download in the browser.
   * @typeParam T - Shape of the row objects.
   * @param rows - Array of rows to export.
   * @param filename - Name of the CSV file to download.
   */
  exportCsv<T extends Record<string, any>>(rows: T[], filename = 'export.csv'): void {
    if (!rows || rows.length === 0) {
      console.warn('No data to export');
      return;
    }

    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(','),                                    // encabezados
      ...rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(',')) // filas
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Acts as a placeholder and just logs the selected format.
   * @param format - Desired export format.
   */
  export(format: 'csv' | 'pdf'): void {
    console.info(`Exporting report as ${format}`);
  }
}
