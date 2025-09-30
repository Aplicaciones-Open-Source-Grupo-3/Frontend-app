import { BaseEntity } from '../../shared/model/base.entity';

export interface ReportEntity extends BaseEntity {
  title: string;
  period: string;
  kpi: number;
  trend: number;
}
