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
}
