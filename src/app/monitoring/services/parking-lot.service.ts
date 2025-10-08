import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseService } from '../../shared/services/base.service';

export interface ParkingOverview {
  occupancyRate: number;
  totalRevenue: number;
  incidents: number;
  occupancyTrend: number;
  revenueTrend: number;
  incidentsTrend: number;
}

@Injectable({ providedIn: 'root' })
export class ParkingLotService extends BaseService {
  getOverview(): Observable<ParkingOverview> {
    return this.get<ParkingOverview[]>('parkingOverview').pipe(
      map(data => data[0]) // 👈 toma el primer objeto del array
    );
  }
}
