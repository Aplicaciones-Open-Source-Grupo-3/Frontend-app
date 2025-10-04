import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseService } from '../../shared/services/base.service';
import { Operator } from '../models/operator.model';

interface CreateOperatorPayload {
  name: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class OperatorsService extends BaseService {
  getOperators(): Observable<Operator[]> {
    return this.get<Operator[]>('api/v1/operators');
  }

  createOperator(payload: CreateOperatorPayload): Observable<Operator> {
    const body: Omit<Operator, 'id'> = {
      ...payload,
      role: 'operator',
      status: 'active',
      lastActiveKey: 'CLIENTS.OPERATORS.LAST_ACTIVE.JUST_NOW'
    };

    return this.http.post<Operator>(`${this.apiUrl}/api/v1/operators`, body);
  }

  deleteOperator(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/v1/operators/${id}`);
  }
}
