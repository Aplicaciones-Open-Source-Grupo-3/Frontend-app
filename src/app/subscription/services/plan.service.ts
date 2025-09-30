import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PlanEntity } from '../model/plan.entity';
import { BaseService } from '../../shared/services/base.service';

@Injectable({ providedIn: 'root' })
export class PlanService extends BaseService {
  getPlans(): Observable<PlanEntity[]> {
    return this.get<PlanEntity[]>('plans');
  }
}
