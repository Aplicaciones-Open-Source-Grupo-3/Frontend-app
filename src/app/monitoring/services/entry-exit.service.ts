import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../iam/services/auth.service';

import { EntryExitEntity } from '../model/entry-exit.entity';

@Injectable({ providedIn: 'root' })
export class EntryExitService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly baseUrl = environment.apiUrl;

  getRecentMovements(): Observable<EntryExitEntity[]> {
    const currentBusiness = this.authService.getCurrentBusiness();
    const businessId = currentBusiness?.id;

    return this.http.get<any[]>(`${this.baseUrl}/api/v1/parking/vehicles`, {
      params: { businessId: businessId?.toString() || '' }
    }).pipe(
      catchError(() => of([])),
      map(vehicles => {
        // Obtener los últimos 10 vehículos (tanto dentro como salidos)
        const sortedVehicles = [...vehicles]
          .sort((a, b) => {
            // Ordenar por fecha de entrada (más recientes primero)
            const dateA = new Date(a.entryDate || a.createdAt);
            const dateB = new Date(b.entryDate || b.createdAt);
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, 10);

        // Mapear a EntryExitEntity
        return sortedVehicles.map(vehicle => ({
          id: vehicle.id?.toString() || '',
          plate: vehicle.licensePlate || vehicle.plate || '',
          entryTime: this.formatTime(vehicle.entryDate),
          exitTime: vehicle.exitDate ? this.formatTime(vehicle.exitDate) : undefined,
          type: vehicle.status === 'INSIDE' ? 'entry' as const : 'exit' as const,
          vehicleType: this.mapVehicleType(vehicle.vehicleType)
        }));
      })
    );
  }

  private formatTime(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  }

  private mapVehicleType(type: string): string {
    const typeMap: { [key: string]: string } = {
      'MOTORCYCLE': 'motorcycle',
      'CAR': 'car',
      'TRUCK': 'truck'
    };
    return typeMap[type] || 'car';
  }
}

