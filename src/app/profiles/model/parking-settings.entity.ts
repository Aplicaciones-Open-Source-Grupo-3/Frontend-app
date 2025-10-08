import { BaseEntity } from '../../shared/model/base.entity';

export interface ParkingSettingsEntity extends BaseEntity {
  openingTime: string;
  closingTime: string;
  motorcycleRate: number;
  carTruckRate: number;
  maxCapacity: number;
  currency: string;
  gracePeriodMinutes: number;
  allowOvernight: boolean;
}

