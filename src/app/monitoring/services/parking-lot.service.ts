import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ParkingOverview {
  occupancyRate: number;
  totalRevenue: number;
  incidents: number;
  occupancyTrend: number;
  revenueTrend: number;
  incidentsTrend: number;
}

interface AccountingRecord {
  amountPaid: number;
  operationDate?: string;
  exitDate: string;
}

interface VehicleRecord {
  status: string;
}

interface IncidentRecord {
  state: string;
}

interface ParkingSettings {
  maxCapacity: number;
}

@Injectable({ providedIn: 'root' })
export class ParkingLotService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getOverview(): Observable<ParkingOverview> {
    return forkJoin({
      accounting: this.http.get<AccountingRecord[]>(`${this.baseUrl}/accounting-records`),
      vehicles: this.http.get<VehicleRecord[]>(`${this.baseUrl}/vehicles`),
      incidents: this.http.get<IncidentRecord[]>(`${this.baseUrl}/incidents`),
      settings: this.http.get<ParkingSettings>(`${this.baseUrl}/parkingSettings`)
    }).pipe(
      map(({ accounting, vehicles, incidents, settings }) => {
        // Calcular ingresos totales
        const totalRevenue = accounting.reduce((sum, record) => sum + record.amountPaid, 0);

        // Calcular tasa de ocupación
        const currentVehicles = vehicles.filter(v => v.status === 'in-space').length;
        const occupancyRate = Math.round((currentVehicles / settings.maxCapacity) * 100);

        // Contar incidencias abiertas
        const openIncidents = incidents.filter(i => i.state === 'open' || i.state === 'in_progress').length;

        // Calcular tendencias (últimos 7 días vs 7 días anteriores)
        const today = new Date();
        const last7Days = new Date(today);
        last7Days.setDate(today.getDate() - 7);
        const last14Days = new Date(today);
        last14Days.setDate(today.getDate() - 14);

        // Ingresos última semana
        const recentRevenue = accounting
          .filter(r => {
            const date = new Date(r.operationDate || r.exitDate);
            return date >= last7Days;
          })
          .reduce((sum, r) => sum + r.amountPaid, 0);

        // Ingresos semana anterior
        const previousRevenue = accounting
          .filter(r => {
            const date = new Date(r.operationDate || r.exitDate);
            return date >= last14Days && date < last7Days;
          })
          .reduce((sum, r) => sum + r.amountPaid, 0);

        // Calcular tendencia de ingresos
        const revenueTrend = previousRevenue > 0
          ? Math.round(((recentRevenue - previousRevenue) / previousRevenue) * 100)
          : 0;

        // Tendencia de ocupación (simulada basada en vehículos actuales)
        const occupancyTrend = occupancyRate > 50 ? Math.floor(Math.random() * 10 + 5) : Math.floor(Math.random() * 5);

        // Tendencia de incidentes (negativa si hay pocas incidencias)
        const incidentsTrend = openIncidents <= 2 ? -Math.floor(Math.random() * 5 + 1) : Math.floor(Math.random() * 3);

        return {
          occupancyRate,
          totalRevenue: Math.round(totalRevenue),
          incidents: openIncidents,
          occupancyTrend,
          revenueTrend,
          incidentsTrend
        };
      })
    );
  }
}
