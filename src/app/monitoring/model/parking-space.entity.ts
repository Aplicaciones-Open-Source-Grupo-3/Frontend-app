import { BaseEntity } from '../../shared/model/base.entity';

export interface ParkingSpaceEntity extends BaseEntity {
  label: string;
  isOccupied: boolean;
  level?: string;
}
