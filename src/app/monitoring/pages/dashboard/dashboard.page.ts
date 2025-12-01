import { AsyncPipe, NgIf, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { combineLatest } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { of } from 'rxjs';

import { ParkingLotService } from '../../services/parking-lot.service';
import { IncidentService } from '../../services/incident.service';
import { EntryExitService } from '../../services/entry-exit.service';
import { OperationsControlComponent } from '../../components/operations-control/operations-control.component';
import { AnalyticsService } from '../../../analytics/services/analytics.service';
import { ParkingSettingsService } from '../../../profiles/services/parking-settings.service';
import { AccountingService } from '../../../accounting/services/accounting.service';

@Component({
  selector: 'app-monitoring-dashboard-page',
  standalone: true,
  imports: [AsyncPipe, NgIf, DecimalPipe, TranslateModule, OperationsControlComponent],
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MonitoringDashboardPageComponent implements OnInit {
  private readonly parkingLotService = inject(ParkingLotService);
  private readonly incidentService = inject(IncidentService);
  private readonly entryExitService = inject(EntryExitService);
  private readonly analyticsService = inject(AnalyticsService);
  private readonly parkingSettingsService = inject(ParkingSettingsService);
  private readonly accountingService = inject(AccountingService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly mapUrl = signal<SafeResourceUrl | null>(null);
  readonly locationError = signal<string | null>(null);

  readonly vm$ = combineLatest([
    this.parkingLotService.getOverview().pipe(
      catchError(error => {
        console.error('❌ Error en getOverview:', error);
        return of({
          occupancyRate: 0,
          totalRevenue: 0,
          incidents: 0,
          occupancyTrend: 0,
          revenueTrend: 0,
          incidentsTrend: 0
        });
      })
    ),
    this.incidentService.getIncidents().pipe(
      catchError(error => {
        console.error('❌ Error en getIncidents:', error);
        return of([]);
      })
    ),
    this.entryExitService.getRecentMovements().pipe(
      catchError(error => {
        console.error('❌ Error en getRecentMovements:', error);
        return of([]);
      })
    ),
    this.analyticsService.getAnalyticsStats().pipe(
      catchError(error => {
        console.error('❌ Error en getAnalyticsStats:', error);
        return of({
          totalVehiclesToday: 0,
          totalVehiclesInside: 0,
          todayRevenue: 0,
          monthRevenue: 0,
          totalSubscribers: 0,
          totalIncidents: 0,
          pendingIncidents: 0
        });
      })
    ),
    this.analyticsService.getOccupancyRate().pipe(
      catchError(error => {
        console.error('❌ Error en getOccupancyRate:', error);
        return of({
          totalSpaces: 0,
          occupiedSpaces: 0,
          availableSpaces: 0,
          occupancyPercentage: 0
        });
      })
    ),
    this.parkingSettingsService.getSettings().pipe(
      catchError(error => {
        console.error('❌ Error en getSettings:', error);
        return of({
          id: 1,
          maxCapacity: 50,
          motorcycleRate: 5.0,
          carTruckRate: 10.0,
          nightRate: 8.0,
          openingTime: '08:00',
          closingTime: '22:00',
          currency: 'PEN',
          gracePeriodMinutes: 15,
          allowOvernight: true
        });
      })
    ),
    this.accountingService.getAll().pipe(
      catchError(error => {
        console.error('❌ Error en getAll accounting:', error);
        return of([]);
      })
    )
  ]).pipe(
    map(([overview, incidents, movements, stats, _occupancyRate, settings, accountingRecords]) => {
      // Calcular occupancy rate real
      const currentVehicles = stats.totalVehiclesInside || 0;
      const maxCapacity = settings.maxCapacity || 100;
      const calculatedOccupancyRate = maxCapacity > 0
        ? (currentVehicles / maxCapacity) * 100
        : 0;

      // Calcular estadía promedio real desde accounting records del día actual
      const averageStay = this.calculateAverageStayFromRecords(accountingRecords);

      return {
        overview,
        incidents,
        movements,
        analytics: {
          totalRevenue: stats.monthRevenue || 0,
          totalVehicles: stats.totalVehiclesToday || 0,
          occupancyRate: calculatedOccupancyRate,
          averageStay: averageStay
        }
      };
    })
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

  private calculateAverageStayFromRecords(records: any[]): number {
    const today = new Date().toISOString().split('T')[0]; // Fecha de hoy en formato YYYY-MM-DD
    const todayRecords = records.filter((record: any) => record.exitDate && record.exitDate.startsWith(today));

    if (todayRecords.length === 0) {
      console.log('⚠️ Dashboard: No hay registros de hoy, retornando 0');
      return 0; // Retornar 0 si no hay registros
    }

    const totalStayTime = todayRecords.reduce((total: number, record: any) => {
      const entryTime = new Date(record.entryDate).getTime();
      const exitTime = new Date(record.exitDate).getTime();
      const stayDuration = (exitTime - entryTime) / (1000 * 60 * 60); // Duración en horas
      return total + stayDuration;
    }, 0);

    const averageStay = totalStayTime / todayRecords.length;

    console.log(`📏 Dashboard: Promedio de estadía calculado: ${averageStay.toFixed(2)} horas (${todayRecords.length} registros)`);

    return averageStay;
  }
}
