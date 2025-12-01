import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface AnalyticsStats {
  totalVehiclesToday: number;
  totalVehiclesInside: number;
  todayRevenue: number;
  monthRevenue: number;
  totalSubscribers: number;
  totalIncidents: number;
  pendingIncidents: number;
}

export interface RevenueTrendResponse {
  [date: string]: number;
}

export interface OccupancyRateResponse {
  totalSpaces: number;
  occupiedSpaces: number;
  availableSpaces: number;
  occupancyPercentage: number;
}

export interface PeakHoursResponse {
  [hour: string]: number;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1/analytics`;

  // Obtener estadísticas generales
  getAnalyticsStats(): Observable<AnalyticsStats> {
    return this.http.get<AnalyticsStats>(`${this.baseUrl}/stats`);
  }

  // Obtener tendencia de ingresos con rango de fechas
  getRevenueTrend(startDate: string, endDate: string): Observable<RevenueTrendResponse> {
    return this.http.get<RevenueTrendResponse>(`${this.baseUrl}/revenue-trend`, {
      params: { startDate, endDate }
    });
  }

  // Obtener tasa de ocupación
  getOccupancyRate(): Observable<OccupancyRateResponse> {
    return this.http.get<OccupancyRateResponse>(`${this.baseUrl}/occupancy-rate`);
  }

  // Obtener horas pico para una fecha específica
  getPeakHours(date: string): Observable<PeakHoursResponse> {
    return this.http.get<PeakHoursResponse>(`${this.baseUrl}/peak-hours`, {
      params: { date }
    });
  }

  // Helper: Obtener fecha en formato YYYY-MM-DD
  getDateString(daysAgo: number = 0): string {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
  }
}

