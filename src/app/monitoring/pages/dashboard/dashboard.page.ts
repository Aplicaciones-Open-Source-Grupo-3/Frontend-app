import { AsyncPipe, NgIf, NgForOf, DecimalPipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { ParkingLotService, ParkingOverview } from '../../services/parking-lot.service';
import { IncidentService } from '../../services/incident.service';
import { IncidentEntity } from '../../model/incident.entity';
import { EntryExitService } from '../../services/entry-exit.service';
import { EntryExitEntity } from '../../model/entry-exit.entity';
import { GoogleMap, MapMarker } from '@angular/google-maps';

interface DashboardViewModel {
  overview: ParkingOverview;
  incidents: IncidentEntity[];
  movements: EntryExitEntity[];
}

@Component({
  selector: 'app-monitoring-dashboard-page',
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf,
    NgForOf,
    DecimalPipe,
    TranslateModule,
    GoogleMap,
    MapMarker,
    NgClass
  ],
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MonitoringDashboardPageComponent implements OnInit {
  private readonly parkingLotService = inject(ParkingLotService);
  private readonly incidentService = inject(IncidentService);
  private readonly entryExitService = inject(EntryExitService);

  readonly vm$ = combineLatest([
    this.parkingLotService.getOverview(),
    this.incidentService.getIncidents(),
    this.entryExitService.getRecentMovements()
  ]).pipe(
    map(([overview, incidents, movements]) => {
      console.log('🟢 DATA RECIBIDA:', { overview, incidents, movements });
      return { overview, incidents, movements };
    })
  );

  // 🗺️ Configuración del mapa
  center: google.maps.LatLngLiteral = { lat: -12.0464, lng: -77.0428 }; // Lima por defecto
  zoom = 13;
  marker: google.maps.LatLngLiteral | null = null;
  markerTitle = '';

  ngOnInit(): void {
    this.initAutocomplete();
  }

  // 📍 Permitir marcar manualmente
  onMapClick(event: google.maps.MapMouseEvent) {
    if (event.latLng) {
      this.marker = event.latLng.toJSON();
      this.markerTitle = 'Ubicación seleccionada manualmente';
    }
  }

  // 🔍 Nuevo sistema de autocomplete (PlaceAutocompleteElement)
  private initAutocomplete() {
    const autocompleteEl = document.getElementById('placeAutocomplete') as HTMLElement;
    if (!autocompleteEl) return;

    customElements.whenDefined('gmp-place-autocomplete').then(() => {
      const autocomplete = autocompleteEl as any;

      // 🌍 Restringir a Perú y solo direcciones
      autocomplete.componentRestrictions = { country: 'PE' };
      autocomplete.types = ['geocode'];

      // 📡 Escuchar cambios
      autocomplete.addEventListener('gmp-placeautocomplete:placechanged', (event: any) => {
        const place = event.detail?.place;

        if (place && place.location) {
          const lat = place.location.lat();
          const lng = place.location.lng();

          console.log('📍 Nueva ubicación:', place.displayName, lat, lng);

          this.center = { lat, lng };
          this.marker = { lat, lng };
          this.markerTitle = place.displayName || 'Ubicación seleccionada';
        } else {
          console.warn('⚠️ No se encontró ubicación para el lugar seleccionado:', place);
        }
      });
    });
  }
}
