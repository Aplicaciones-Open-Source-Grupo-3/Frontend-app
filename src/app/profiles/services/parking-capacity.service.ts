import { Injectable } from '@angular/core';
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
  constructor(
    private vehicleService: VehicleService,
    private settingsService: ParkingSettingsService
  ) {}

  getCapacity(): Observable<ParkingCapacity> {
    return combineLatest([
      this.vehicleService.getVehicles(),
      this.settingsService.getSettings()
    ]).pipe(
      map(([vehicles, settings]) => {
        // Contar solo vehículos con estado 'in-space' o sin estado (por defecto están dentro)
        const occupied = vehicles.filter(v => v.status === 'in-space' || !v.status).length;
        const total = settings.maxCapacity;
        const available = total - occupied;

        return {
          total,
          occupied,
          available
        };
      })
    );
  }
}

