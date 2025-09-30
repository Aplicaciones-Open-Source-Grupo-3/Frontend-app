import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { ParkingLotService, ParkingOverview } from '../../services/parking-lot.service';
import { IncidentService } from '../../services/incident.service';
import { IncidentEntity } from '../../model/incident.entity';
import { ParkingLotStatusComponent } from '../../components/parking-lot-status/parking-lot-status.component';
import { IncidentListComponent } from '../../components/incident-list/incident-list.component';
import { VehicleEntryExitComponent } from '../../components/vehicle-entry-exit/vehicle-entry-exit.component';
import { EntryExitService } from '../../services/entry-exit.service';
import { EntryExitEntity } from '../../model/entry-exit.entity';

interface DashboardViewModel {
  overview: ParkingOverview;
  incidents: IncidentEntity[];
  movements: EntryExitEntity[];
}

@Component({
  selector: 'app-monitoring-dashboard-page',
  standalone: true,
  imports: [AsyncPipe, NgIf, TranslateModule, ParkingLotStatusComponent, IncidentListComponent, VehicleEntryExitComponent],
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MonitoringDashboardPageComponent {
  private readonly parkingLotService = inject(ParkingLotService);
  private readonly incidentService = inject(IncidentService);
  private readonly entryExitService = inject(EntryExitService);

  readonly vm$ = combineLatest([
    this.parkingLotService.getOverview(),
    this.incidentService.getIncidents(),
    this.entryExitService.getRecentMovements()
  ]).pipe(
    map(([overview, incidents, movements]) => ({ overview, incidents, movements }))
  );
}
