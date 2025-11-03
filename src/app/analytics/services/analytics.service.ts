import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AccountingRecord {
  id: string;
  registrationNumber: string;
  entryDate: string;
  exitDate: string;
  vehicleType: string;
  plate: string;
  entryTime: string;
  exitTime: string;
  amountPaid: number;
  currency: string;
  hoursParked: number;
  hoursToPay: number;
  ratePerHour: number;
  operationDate: string;
  nightCharge?: number;
}

export interface VehicleRecord {
  id: string;
  plate: string;
  vehicleType: string;
  status: string;
  entryDate: string;
  entryTime: string;
}

export interface OperationRecord {
  id: string;
  date: string;
  openTime: string;
  closeTime?: string;
  status: string;
}

export interface RevenueByType {
  cars: number;
  motorcycles: number;
  total: number;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
}

export interface AnalyticsStats {
  totalRevenue: number;
  totalVehicles: number;
  averageStay: number;
  occupancyRate: number;
  revenueByType: RevenueByType;
  dailyRevenue: DailyRevenue[];
  revenueByDate: { [key: string]: number };
  vehiclesByType: { cars: number; motorcycles: number };
  currentVehicles: number;
  peakHours: { hour: string; count: number }[];
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getAccountingRecords(): Observable<AccountingRecord[]> {
    return this.http.get<AccountingRecord[]>(`${this.baseUrl}/accounting-records`);
  }

  getVehicles(): Observable<VehicleRecord[]> {
    return this.http.get<VehicleRecord[]>(`${this.baseUrl}/vehicles`);
  }

  getOperations(): Observable<OperationRecord[]> {
    return this.http.get<OperationRecord[]>(`${this.baseUrl}/operations`);
  }

  getParkingSettings(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/parkingSettings`);
  }

  getAnalyticsStats(): Observable<AnalyticsStats> {
    return forkJoin({
      accounting: this.getAccountingRecords(),
      vehicles: this.getVehicles(),
      settings: this.getParkingSettings()
    }).pipe(
      map(({ accounting, vehicles, settings }) => {
        // Total revenue
        const totalRevenue = accounting.reduce((sum, record) => sum + record.amountPaid, 0);

        // Total vehicles processed
        const totalVehicles = accounting.length;

        // Average stay time
        const totalHours = accounting.reduce((sum, record) => sum + record.hoursParked, 0);
        const averageStay = totalVehicles > 0 ? totalHours / totalVehicles : 0;

        // Revenue by vehicle type
        const revenueByType: RevenueByType = {
          cars: accounting
            .filter(r => r.vehicleType === 'auto-camioneta')
            .reduce((sum, r) => sum + r.amountPaid, 0),
          motorcycles: accounting
            .filter(r => r.vehicleType === 'moto')
            .reduce((sum, r) => sum + r.amountPaid, 0),
          total: totalRevenue
        };

        // Vehicles by type
        const vehiclesByType = {
          cars: accounting.filter(r => r.vehicleType === 'auto-camioneta').length,
          motorcycles: accounting.filter(r => r.vehicleType === 'moto').length
        };

        // Daily revenue
        const revenueByDate: { [key: string]: number } = {};
        accounting.forEach(record => {
          const date = record.operationDate || record.exitDate;
          if (!revenueByDate[date]) {
            revenueByDate[date] = 0;
          }
          revenueByDate[date] += record.amountPaid;
        });

        const dailyRevenue: DailyRevenue[] = Object.entries(revenueByDate)
          .map(([date, revenue]) => ({ date, revenue }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(-7); // Last 7 days

        // Current vehicles in parking
        const currentVehicles = vehicles.filter(v => v.status === 'in-space').length;

        // Occupancy rate
        const maxCapacity = settings.maxCapacity || 100;
        const occupancyRate = (currentVehicles / maxCapacity) * 100;

        // Peak hours analysis
        const hourCounts: { [key: string]: number } = {};
        accounting.forEach(record => {
          const hour = record.entryTime.split(':')[0];
          hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });

        const peakHours = Object.entries(hourCounts)
          .map(([hour, count]) => ({ hour: `${hour}:00`, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        return {
          totalRevenue,
          totalVehicles,
          averageStay,
          occupancyRate,
          revenueByType,
          dailyRevenue,
          revenueByDate,
          vehiclesByType,
          currentVehicles,
          peakHours
        };
      })
    );
  }
}
