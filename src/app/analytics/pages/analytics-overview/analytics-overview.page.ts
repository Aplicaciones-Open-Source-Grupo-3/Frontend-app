import { AsyncPipe, NgFor, NgIf, DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { AnalyticsService, AnalyticsStats } from '../../services/analytics.service';

/**
 * View model for the “Customer & Subscription History” table.
 */
interface SubHistoryRow {
  id: number;
  customerName: string;
  subscriptionType: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired' | string;
}

/**
 * Renders the Reports/Analytics Overview page.
 */
@Component({
  selector: 'app-analytics-overview-page',
  standalone: true,
  imports: [
    AsyncPipe, NgFor, NgIf, DatePipe, DecimalPipe,
    TranslateModule
  ],
  templateUrl: './analytics-overview.page.html',
  styleUrls: ['./analytics-overview.page.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalyticsOverviewPageComponent {
  private readonly analyticsService = inject(AnalyticsService);

  readonly stats$: Observable<AnalyticsStats> = this.analyticsService.getAnalyticsStats();

  getMaxRevenue(dailyRevenue: any[]): number {
    if (!dailyRevenue || dailyRevenue.length === 0) return 0;
    return Math.max(...dailyRevenue.map(d => d.revenue));
  }

  getBarHeight(revenue: number, maxRevenue: number): string {
    if (maxRevenue === 0) return '0%';
    return `${(revenue / maxRevenue) * 100}%`;
  }

  onExportPDF(): void {
    alert('Exportando reporte en PDF...');
  }

  onExportExcel(): void {
    alert('Exportando reporte en Excel...');
  }
}
