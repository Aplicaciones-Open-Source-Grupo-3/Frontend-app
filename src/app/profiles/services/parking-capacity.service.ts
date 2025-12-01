import { Injectable, inject } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { VehicleService } from '../../monitoring/services/vehicle.service';
import { ParkingSettingsService } from './parking-settings.service';

export interface ParkingCapacity {
  total: number;
  occupied: number;
  available: number;
}

@Injectable({ providedIn: 'root' })
export class ParkingCapacityService {
  private readonly vehicleService = inject(VehicleService);
  private readonly settingsService = inject(ParkingSettingsService);

  getCapacity(): Observable<ParkingCapacity> {
    return combineLatest([
      this.vehicleService.getVehicles(),
      this.settingsService.getSettings()
    ]).pipe(
      map(([vehicles, settings]: [any[], any]) => {
        // Contar solo vehículos con estado 'INSIDE' (del backend)
        const occupied = vehicles.filter((v: any) => {
          const status = v.status?.toString().toUpperCase();
          return status === 'INSIDE' || v.status === 'in-space';
        }).length;

        const total = settings?.maxCapacity || 50;
        const available = total - occupied;

        return {
          total,
          occupied,
          available: Math.max(0, available)
        };
      })
    );
  }
}
