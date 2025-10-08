import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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
export class MonitoringDashboardPageComponent implements OnInit {
  private readonly parkingLotService = inject(ParkingLotService);
  private readonly incidentService = inject(IncidentService);
  private readonly entryExitService = inject(EntryExitService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly mapUrl = signal<SafeResourceUrl | null>(null);
  readonly locationError = signal<string | null>(null);

  readonly vm$ = combineLatest([
    this.parkingLotService.getOverview(),
    this.incidentService.getIncidents(),
    this.entryExitService.getRecentMovements()
  ]).pipe(
    map(([overview, incidents, movements]) => ({ overview, incidents, movements }))
  );

  ngOnInit(): void {
    this.getCurrentLocation();
  }

  private getCurrentLocation(): void {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const url = `https://maps.google.com/maps?q=${lat},${lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
          this.mapUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
        },
        (error) => {
          console.error('Error getting location:', error);
          // Ubicación por defecto (Lima, Perú - puedes cambiarla)
          const defaultUrl = 'https://maps.google.com/maps?q=-12.0464,-77.0428&t=&z=15&ie=UTF8&iwloc=&output=embed';
          this.mapUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(defaultUrl));
          this.locationError.set('No se pudo obtener la ubicación. Mostrando ubicación predeterminada.');
        }
      );
    } else {
      // Si no hay geolocalización, usar ubicación por defecto
      const defaultUrl = 'https://maps.google.com/maps?q=-12.0464,-77.0428&t=&z=15&ie=UTF8&iwloc=&output=embed';
      this.mapUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(defaultUrl));
      this.locationError.set('Geolocalización no disponible. Mostrando ubicación predeterminada.');
    }
  }
}
