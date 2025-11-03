import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

import { EntryExitEntity } from '../model/entry-exit.entity';

interface VehicleRecord {
  id: string;
  plate: string;
  entryTime: string;
  entryDate: string;
  status: string;
  exitTime?: string;
  registrationNumber: string;
}

@Injectable({ providedIn: 'root' })
export class EntryExitService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getRecentMovements(): Observable<EntryExitEntity[]> {
    return this.http.get<VehicleRecord[]>(`${this.baseUrl}/vehicles`).pipe(
      map(vehicles => {
        // Obtener los últimos 10 vehículos (tanto dentro como salidos)
        const sortedVehicles = [...vehicles]
          .sort((a, b) => {
            // Ordenar por fecha y hora de entrada (más recientes primero)
            const dateA = new Date(`${a.entryDate} ${a.entryTime}`);
            const dateB = new Date(`${b.entryDate} ${b.entryTime}`);
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, 10);

        // Mapear a EntryExitEntity
        return sortedVehicles.map(vehicle => ({
          id: vehicle.id,
          plate: vehicle.plate,
          entryTime: vehicle.entryTime
        }));
      })
    );
  }
}

