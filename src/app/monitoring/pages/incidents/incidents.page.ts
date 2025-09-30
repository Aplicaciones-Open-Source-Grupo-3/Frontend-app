import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { IncidentService } from '../../services/incident.service';
import { IncidentEntity } from '../../model/incident.entity';
import { IncidentListComponent } from '../../components/incident-list/incident-list.component';
import { IncidentFormComponent } from '../../components/incident-form/incident-form.component';

@Component({
  selector: 'app-monitoring-incidents-page',
  standalone: true,
  imports: [AsyncPipe, NgIf, TranslateModule, IncidentListComponent, IncidentFormComponent],
  templateUrl: './incidents.page.html',
  styleUrls: ['./incidents.page.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MonitoringIncidentsPageComponent {
  private readonly incidentService = inject(IncidentService);

  readonly incidents$: Observable<IncidentEntity[]> = this.incidentService.getIncidents();
}
