import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ProfileEntity } from '../model/profile.entity';
import { BaseService } from '../../shared/services/base.service';

@Injectable({ providedIn: 'root' })
export class ProfileService extends BaseService {
  getProfile(id: number): Observable<ProfileEntity> {
    return this.get<ProfileEntity>(`profiles/${id}`);
  }
}
