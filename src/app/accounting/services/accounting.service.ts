import { Injectable } from '@angular/core';
import { BaseService } from '../../shared/services/base.service';
import { AccountingRecord } from '../model/accounting-record.entity';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AccountingService extends BaseService {
  private readonly endpoint = 'accounting-records';

  getAll(): Observable<AccountingRecord[]> {
    return this.get<AccountingRecord[]>(this.endpoint);
  }

  create(record: Partial<AccountingRecord>): Observable<AccountingRecord> {
    return this.post<AccountingRecord>(this.endpoint, record);
  }

  getRecordsByVehicleType(vehicleType: 'auto-camioneta' | 'moto'): Observable<AccountingRecord[]> {
    return this.getAll().pipe(
      map(records => records.filter(record => record.vehicleType === vehicleType))
    );
  }

  searchByPlate(plate: string): Observable<AccountingRecord[]> {
    return this.getAll().pipe(
      map(records =>
        records.filter(record =>
          record.plate.toUpperCase().includes(plate.toUpperCase())
        )
      )
    );
  }

  // Filtrar por fecha de operación
  getRecordsByDate(date: string): Observable<AccountingRecord[]> {
    return this.getAll().pipe(
      map(records => records.filter(record => record.operationDate === date))
    );
  }

  // Obtener registros en un rango de fechas
  getRecordsByDateRange(startDate: string, endDate: string): Observable<AccountingRecord[]> {
    return this.getAll().pipe(
      map(records => records.filter(record => {
        if (!record.operationDate) return false;
        return record.operationDate >= startDate && record.operationDate <= endDate;
      }))
    );
  }

  // Obtener ingresos por día
  getRevenueByDate(date: string): Observable<number> {
    return this.getRecordsByDate(date).pipe(
      map(records => records.reduce((sum, record) => sum + record.amountPaid, 0))
    );
  }

  // Obtener ingresos agrupados por día
  getRevenueGroupedByDate(): Observable<{ date: string; revenue: number }[]> {
    return this.getAll().pipe(
      map(records => {
        const grouped = records.reduce((acc, record) => {
          const date = record.operationDate || record.exitDate;
          if (!acc[date]) {
            acc[date] = 0;
          }
          acc[date] += record.amountPaid;
          return acc;
        }, {} as { [key: string]: number });

        return Object.entries(grouped)
          .map(([date, revenue]) => ({ date, revenue }))
          .sort((a, b) => b.date.localeCompare(a.date));
      })
    );
  }

  getTotalRevenue(): Observable<number> {
    return this.getAll().pipe(
      map(records => records.reduce((sum, record) => sum + record.amountPaid, 0))
    );
  }

  getRevenueByVehicleType(): Observable<{ cars: number; motorcycles: number }> {
    return this.getAll().pipe(
      map(records => {
        const cars = records
          .filter(r => r.vehicleType === 'auto-camioneta')
          .reduce((sum, r) => sum + r.amountPaid, 0);
        const motorcycles = records
          .filter(r => r.vehicleType === 'moto')
          .reduce((sum, r) => sum + r.amountPaid, 0);
        return { cars, motorcycles };
      })
    );
  }

  getTotalVehicles(): Observable<number> {
    return this.getAll().pipe(
      map(records => records.length)
    );
  }

  getAverageStayTime(): Observable<number> {
    return this.getAll().pipe(
      map(records => {
        if (records.length === 0) return 0;
        const totalHours = records.reduce((sum, r) => sum + r.hoursParked, 0);
        return totalHours / records.length;
      })
    );
  }
}
