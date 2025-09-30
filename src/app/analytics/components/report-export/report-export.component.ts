import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { ReportService } from '../../services/report.service';

@Component({
  selector: 'app-report-export',
  standalone: true,
  imports: [TranslateModule],
  template: `
    <div class="export">
      <h2>{{ 'ANALYTICS.EXPORT.TITLE' | translate }}</h2>
      <button type="button" (click)="export('csv')">CSV</button>
      <button type="button" (click)="export('pdf')">PDF</button>
    </div>
  `,
  styles: [
    `
      .export {
        display: flex;
        gap: 1rem;
        align-items: center;
      }

      button {
        padding: 0.5rem 1rem;
        border-radius: 999px;
        border: 1px solid rgba(148, 163, 184, 0.4);
        background: rgba(15, 23, 42, 0.35);
        color: #e2e8f0;
        cursor: pointer;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportExportComponent {
  private readonly reportService = inject(ReportService);

  export(format: 'csv' | 'pdf'): void {
    this.reportService.export(format);
  }
}
