import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { ReportEntity } from '../../model/report.entity';

@Component({
  selector: 'app-dashboard-widget',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './dashboard-widget.component.html',
  styleUrls: ['./dashboard-widget.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardWidgetComponent {
  @Input({ required: true }) report!: ReportEntity;

  get titleKey(): string {
    return `ANALYTICS.KPIS.${this.report.title.toUpperCase().replace(/\s+/g, '_')}`;
  }

  get periodKey(): string {
    return `ANALYTICS.KPIS.${this.report.period.toUpperCase().replace(/\s+/g, '_')}`;
  }
}
