import { BaseEntity } from '../../shared/model/base.entity';

export type VehicleType = 'auto-camioneta' | 'moto';
export type VehicleStatus = 'in-space' | 'out';

export interface VehicleEntity extends BaseEntity {
  registrationNumber: string;
  entryDate: string;
  vehicleType: VehicleType;
  plate: string;
  entryTime: string;
  status?: VehicleStatus;
  exitTime?: string;
  exitDate?: string;
  businessId?: string;
}
