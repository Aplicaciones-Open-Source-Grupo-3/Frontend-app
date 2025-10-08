import {AsyncPipe, NgFor, NgIf, DatePipe, TitleCasePipe, CurrencyPipe} from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import {firstValueFrom, forkJoin, map, Observable} from 'rxjs';
import { ReportEntity } from '../../model/report.entity';
import { DashboardWidgetComponent } from '../../components/dashboard-widget/dashboard-widget.component';
import { KpiGraphComponent } from '../../components/kpi-graph/kpi-graph.component';
import { ReportExportComponent } from '../../components/report-export/report-export.component';
import {ReportService} from '../../services/report.service';

import {
  AnalyticsService,
  PlanDto,
  PlanEntity, ProfileDto,
  SubscriptionDto,
  SubscriptionEntity
} from '../../services/analytics.service';

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
    AsyncPipe, NgFor, NgIf, DatePipe, TitleCasePipe,
    TranslateModule, DashboardWidgetComponent, KpiGraphComponent, CurrencyPipe
  ],
  templateUrl: './analytics-overview.page.html',
  styleUrls: ['./analytics-overview.page.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalyticsOverviewPageComponent {
  private readonly analyticsService = inject(AnalyticsService);
  private readonly reportService = inject(ReportService);

  /**
   * Top KPI cards: stream of reports for the header widgets.
   */
  readonly reports$: Observable<ReportEntity[]> = this.analyticsService.getReports();

  /**
   * Revenue KPI (number) extracted from the reports stream.
   */
  readonly revenueKpi$ = this.reports$.pipe(
    map(list => list.find(r => r.title.toLowerCase() === 'revenue')?.kpi ?? 0)
  );

  /**
   * Occupancy KPI (percentage) extracted from the reports stream.
   */
  readonly occupancyKpi$ = this.reports$.pipe(
    map(list => list.find(r => r.title.toLowerCase() === 'occupancy')?.kpi ?? 0)
  );


  readonly incidentsKpi$ = this.reports$.pipe(
    map(list => list.find(r => r.title.toLowerCase() === 'incidents')?.kpi ?? 0)
  );



  /**
   * Customer & Subscription History table.
   * Joins subscriptions, plans and profile in parallel, then maps
   * them to a flat row model consumable by the template.
   */
  readonly subHistory$: Observable<SubHistoryRow[]> = forkJoin({
    subs: this.analyticsService.getSubscriptions(),
    plans: this.analyticsService.getPlans(),
    profile: this.analyticsService.getProfile()
  }).pipe(
    map(({ subs, plans, profile }) => this.mapHistoryRows(subs, plans, profile))
  );

  /**
   * Maps DTOs from the API into table rows.
   */
  private mapHistoryRows(subs: SubscriptionDto[], plans: PlanDto[], profile: ProfileDto): SubHistoryRow[] {
    return subs.map((s): SubHistoryRow => {
      const plan = plans.find(p => p.id === s.planId);
      const end = new Date(s.renewsAt);
      const start = new Date(end); start.setFullYear(end.getFullYear() - 1);
      return {
        id: s.id,
        customerName: profile.fullName,
        subscriptionType: plan?.name ?? '—',
        startDate: start,
        endDate: end,
        status: s.status
      };
    });
  }

  /**
   * Export the current table rows to CSV.
   */
  async onExport(): Promise<void> {
    const rows = await firstValueFrom(this.subHistory$);
    this.reportService.exportCsv(rows, 'subscription-history.csv');
  }

  /**
   * Logs to the console to keep the UI wired.
   */
  onGenerate(): void {
    console.info('Generate Report clicked');
  }


}




