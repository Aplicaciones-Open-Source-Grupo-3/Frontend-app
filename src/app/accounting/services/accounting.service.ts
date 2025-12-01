import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface AccountingRecordResource {
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
  nightCharge: number;
  businessId: string;
}

export interface CreateAccountingRecordRequest {
  recordType: 'INCOME' | 'EXPENSE' | 'ADJUSTMENT';
  amount: number;
  description: string;
  category?: string;
  recordDate?: string; // ISO 8601 format
  relatedOperationId?: number;
}

export interface RevenueResource {
  totalRevenue: number;
}

@Injectable({ providedIn: 'root' })
export class AccountingService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1/accounting/records`;

  /**
   * Listar todos los registros contables del negocio
   * GET /api/v1/accounting/records
   */
  getAll(): Observable<AccountingRecordResource[]> {
    return this.http.get<AccountingRecordResource[]>(this.baseUrl).pipe(
      catchError(err => {
        console.error('❌ Error al obtener registros contables:', err);
        return of([]);
      })
    );
  }

  /**
   * Crear un nuevo registro contable
   * POST /api/v1/accounting/records
   */
  create(record: CreateAccountingRecordRequest): Observable<AccountingRecordResource> {
    return this.http.post<AccountingRecordResource>(this.baseUrl, record).pipe(
      catchError(err => {
        console.error('❌ Error al crear registro contable:', err);
        throw err;
      })
    );
  }

  /**
   * Obtener un registro contable por ID
   * GET /api/v1/accounting/records/{recordId}
   */
  getById(recordId: number | string): Observable<AccountingRecordResource> {
    return this.http.get<AccountingRecordResource>(`${this.baseUrl}/${recordId}`).pipe(
      catchError(err => {
        console.error('❌ Error al obtener registro contable:', err);
        throw err;
      })
    );
  }

  /**
   * Obtener ingresos totales del negocio
   * GET /api/v1/accounting/records/revenue/total
   */
  getTotalRevenue(): Observable<number> {
    return this.http.get<RevenueResource>(`${this.baseUrl}/revenue/total`).pipe(
      map(response => response.totalRevenue),
      catchError(err => {
        console.error('❌ Error al obtener ingresos totales:', err);
        return of(0);
      })
    );
  }

  /**
   * Obtener ingresos por rango de fechas
   * GET /api/v1/accounting/records/revenue/by-date?startDate=xxx&endDate=xxx
   * @param startDate Formato: yyyy-MM-dd (ej: "2025-11-01")
   * @param endDate Formato: yyyy-MM-dd (ej: "2025-11-07")
   */
  getRevenueByDateRange(startDate: string, endDate: string): Observable<number> {
    return this.http.get<RevenueResource>(`${this.baseUrl}/revenue/by-date`, {
      params: { startDate, endDate }
    }).pipe(
      map(response => response.totalRevenue),
      catchError(err => {
        console.error('❌ Error al obtener ingresos por fecha:', err);
        return of(0);
      })
    );
  }

  // ==========================================
  // MÉTODOS DE COMPATIBILIDAD Y UTILIDAD
  // ==========================================

  /**
   * Obtener ingresos agrupados por fecha (para gráficos)
   * Se calcula en el frontend agrupando los registros
   */
  getRevenueGroupedByDate(): Observable<{ date: string; revenue: number }[]> {
    return this.getAll().pipe(
      map(records => {
        // Agrupar por fecha de operación
        const grouped = records.reduce((acc: any, record) => {
          const date = record.operationDate || record.exitDate || record.entryDate;
          if (date && !acc[date]) {
            acc[date] = 0;
          }
          if (date) {
            acc[date] += record.amountPaid || 0;
          }
          return acc;
        }, {});

        // Convertir a array y ordenar
        return Object.keys(grouped)
          .map(date => ({
            date,
            revenue: grouped[date]
          }))
          .sort((a, b) => a.date.localeCompare(b.date));
      }),
      catchError(() => of([]))
    );
  }

  /**
   * Obtener ingresos por tipo de vehículo
   * Se calcula en el frontend sumando los registros por tipo
   */
  getRevenueByVehicleType(): Observable<{ cars: number; motorcycles: number }> {
    return this.getAll().pipe(
      map(records => {
        const carRevenue = records
          .filter(r => {
            const type = r.vehicleType?.toString().toUpperCase();
            return type === 'CAR' || type === 'TRUCK' || type === 'AUTO-CAMIONETA';
          })
          .reduce((sum, r) => sum + (r.amountPaid || 0), 0);

        const motorcycleRevenue = records
          .filter(r => {
            const type = r.vehicleType?.toString().toUpperCase();
            return type === 'MOTORCYCLE' || type === 'MOTO';
          })
          .reduce((sum, r) => sum + (r.amountPaid || 0), 0);

        return {
          cars: carRevenue,
          motorcycles: motorcycleRevenue
        };
      }),
      catchError(() => of({ cars: 0, motorcycles: 0 }))
    );
  }

  /**
   * Obtener total de vehículos atendidos (registros contables)
   */
  getTotalVehicles(): Observable<number> {
    return this.getAll().pipe(
      map(records => records.length),
      catchError(() => of(0))
    );
  }

  /**
   * Obtener tiempo promedio de estadía
   */
  getAverageStayTime(): Observable<number> {
    return this.getAll().pipe(
      map(records => {
        if (records.length === 0) return 0;

        const totalHours = records.reduce((sum, r) => sum + (r.hoursParked || 0), 0);
        return totalHours / records.length;
      }),
      catchError(() => of(0))
    );
  }

  /**
   * Filtrar registros por tipo de vehículo (frontend)
   */
  getRecordsByVehicleType(vehicleType: string): Observable<AccountingRecordResource[]> {
    return this.getAll().pipe(
      map(records => records.filter(r => {
        const type = r.vehicleType?.toString().toUpperCase();
        const searchType = vehicleType.toUpperCase();
        return type === searchType || type?.includes(searchType);
      }))
    );
  }

  /**
   * Buscar registros por placa (frontend)
   */
  searchByPlate(plate: string): Observable<AccountingRecordResource[]> {
    return this.getAll().pipe(
      map(records => records.filter(r =>
        r.plate?.toUpperCase().includes(plate.toUpperCase())
      ))
    );
  }

  /**
   * Filtrar registros por fecha específica (frontend)
   */
  getRecordsByDate(date: string): Observable<AccountingRecordResource[]> {
    return this.getAll().pipe(
      map(records => records.filter(r =>
        r.operationDate === date || r.entryDate === date || r.exitDate === date
      ))
    );
  }

  /**
   * Filtrar registros por rango de fechas (frontend)
   */
  getRecordsByDateRange(startDate: string, endDate: string): Observable<AccountingRecordResource[]> {
    return this.getAll().pipe(
      map(records => records.filter(r => {
        const recordDate = r.operationDate || r.exitDate || r.entryDate;
        return recordDate >= startDate && recordDate <= endDate;
      }))
    );
  }

  /**
   * Calcular ingresos de una fecha específica (frontend)
   */
  getRevenueByDate(date: string): Observable<number> {
    return this.getRecordsByDate(date).pipe(
      map(records => records.reduce((sum, r) => sum + (r.amountPaid || 0), 0))
    );
  }

  /**
   * Formatear fecha a formato yyyy-MM-dd para los query params del backend
   */
  private formatDateForBackend(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

