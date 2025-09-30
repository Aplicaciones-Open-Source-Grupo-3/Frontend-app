import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { AnalyticsService } from '../../services/analytics.service';
import { ReportEntity } from '../../model/report.entity';
import { DashboardWidgetComponent } from '../../components/dashboard-widget/dashboard-widget.component';
import { KpiGraphComponent } from '../../components/kpi-graph/kpi-graph.component';
import { ReportExportComponent } from '../../components/report-export/report-export.component';

@Component({
  selector: 'app-analytics-overview-page',
  standalone: true,
  imports: [AsyncPipe, NgFor, NgIf, TranslateModule, DashboardWidgetComponent, KpiGraphComponent, ReportExportComponent],
  templateUrl: './analytics-overview.page.html',
  styleUrls: ['./analytics-overview.page.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalyticsOverviewPageComponent {
  private readonly analyticsService = inject(AnalyticsService);

  readonly reports$: Observable<ReportEntity[]> = this.analyticsService.getReports();
}
