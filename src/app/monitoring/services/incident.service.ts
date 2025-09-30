import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IncidentEntity } from '../model/incident.entity';
import { BaseService } from '../../shared/services/base.service';

@Injectable({ providedIn: 'root' })
export class IncidentService extends BaseService {
  getIncidents(): Observable<IncidentEntity[]> {
    return this.get<IncidentEntity[]>('incidents');
  }
}
