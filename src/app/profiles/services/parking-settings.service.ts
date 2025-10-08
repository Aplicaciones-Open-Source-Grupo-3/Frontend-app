import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { ParkingSettingsEntity } from '../model/parking-settings.entity';
import { BaseService } from '../../shared/services/base.service';

@Injectable({ providedIn: 'root' })
export class ParkingSettingsService extends BaseService {
  getSettings(): Observable<ParkingSettingsEntity> {
    return this.get<ParkingSettingsEntity>('parkingSettings');
  }

  updateSettings(settings: Partial<ParkingSettingsEntity>): Observable<ParkingSettingsEntity> {
    return this.put<ParkingSettingsEntity>('parkingSettings', settings);
  }
}

