import { BaseEntity } from '../../shared/model/base.entity';

export interface PlanEntity extends BaseEntity {
  name: string;
  price: number;
  benefits: string[];
}
