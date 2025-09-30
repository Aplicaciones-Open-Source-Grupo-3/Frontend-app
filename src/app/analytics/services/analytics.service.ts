import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseService } from '../../shared/services/base.service';
import { ReportEntity } from '../model/report.entity';

@Injectable({ providedIn: 'root' })
export class AnalyticsService extends BaseService {
  getReports(): Observable<ReportEntity[]> {
    return this.get<ReportEntity[]>('reports');
  }
}
