import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { SubscriptionEntity } from '../model/subscription.entity';
import { BaseService } from '../../shared/services/base.service';

@Injectable({ providedIn: 'root' })
export class SubscriptionService extends BaseService {
  getSubscriptions(): Observable<SubscriptionEntity[]> {
    return this.get<SubscriptionEntity[]>('subscriptions');
  }
}
