import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { VehicleEntity } from '../model/vehicle.entity';
import { BaseService } from '../../shared/services/base.service';

@Injectable({ providedIn: 'root' })
export class VehicleService extends BaseService {
  getVehicles(): Observable<VehicleEntity[]> {
    return this.get<VehicleEntity[]>('vehicles');
  }

  addVehicle(vehicle: Partial<VehicleEntity>): Observable<VehicleEntity> {
    return this.post<VehicleEntity>('vehicles', vehicle);
  }

  updateVehicle(id: number | string, data: Partial<VehicleEntity>): Observable<VehicleEntity> {
    return this.patch<VehicleEntity>(`vehicles/${id}`, data);
  }

  deleteVehicle(id: number | string): Observable<void> {
    return this.delete<void>(`vehicles/${id}`);
  }
}
