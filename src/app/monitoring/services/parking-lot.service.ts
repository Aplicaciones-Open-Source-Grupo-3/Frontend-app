import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../iam/services/auth.service';

export interface ParkingOverview {
  occupancyRate: number;
  totalRevenue: number;
  incidents: number;
  occupancyTrend: number;
  revenueTrend: number;
  incidentsTrend: number;
}

@Injectable({ providedIn: 'root' })
export class ParkingLotService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly baseUrl = environment.apiUrl;

  getOverview(): Observable<ParkingOverview> {
    const currentBusiness = this.authService.getCurrentBusiness();
    const businessId = currentBusiness?.id;

    return forkJoin({
      revenue: this.http.get<{ total: number }>(`${this.baseUrl}/api/v1/accounting/revenue/total`, {
        params: { businessId: businessId?.toString() || '' }
      }).pipe(catchError(() => of({ total: 0 }))),

      vehicles: this.http.get<any[]>(`${this.baseUrl}/api/v1/parking/vehicles`, {
        params: { businessId: businessId?.toString() || '' }
      }).pipe(catchError(() => of([]))),

      incidents: this.http.get<any[]>(`${this.baseUrl}/api/v1/parking/incidents/pending`, {
        params: { businessId: businessId?.toString() || '' }
      }).pipe(catchError(() => of([]))),

      stats: this.http.get<any>(`${this.baseUrl}/api/v1/analytics/stats`, {
        params: { businessId: businessId?.toString() || '' }
      }).pipe(catchError(() => of({ occupancyRate: 0 })))
    }).pipe(
      map(({ revenue, vehicles, incidents, stats }) => {
        // Calcular vehículos actuales
        const currentVehicles = vehicles.filter((v: any) => v.status === 'INSIDE').length;
        const maxCapacity = currentBusiness?.maxCapacity || 100;
        const occupancyRate = maxCapacity > 0
          ? Math.round((currentVehicles / maxCapacity) * 100)
          : stats.occupancyRate || 0;

        return {
          occupancyRate,
          totalRevenue: revenue.total || 0,
          incidents: incidents.length || 0,
          occupancyTrend: 0, // Por ahora sin tendencia
          revenueTrend: 0,
          incidentsTrend: 0
        };
      })
    );
  }
}
