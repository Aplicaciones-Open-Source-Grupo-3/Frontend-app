import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ReportService {
  export(format: 'csv' | 'pdf'): void {
    console.info(`Exporting report as ${format}`);
  }
}
