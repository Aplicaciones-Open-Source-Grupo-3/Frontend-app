import { BaseEntity } from '../../shared/model/base.entity';
import { IncidentState } from '../../shared/model/enum/incident-state.enum';

export interface IncidentEntity extends BaseEntity {
  time: string;
  location: string;
  description: string;
  state: IncidentState;
  businessId?: string;
}
