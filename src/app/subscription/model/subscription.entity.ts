import { BaseEntity } from '../../shared/model/base.entity';

export interface SubscriptionEntity extends BaseEntity {
  planId: number;
  status: 'active' | 'expired' | 'paused';
  renewsAt: string;
}
