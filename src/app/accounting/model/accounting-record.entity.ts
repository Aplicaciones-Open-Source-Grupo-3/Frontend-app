import { BaseEntity } from '../../shared/model/base.entity';

export interface AccountingRecord extends BaseEntity {
  registrationNumber: string;
  entryDate: string;
  exitDate: string;
  vehicleType: 'auto-camioneta' | 'moto';
  plate: string;
  entryTime: string;
  exitTime: string;
  amountPaid: number;
  currency: string;
  hoursParked: number;
  hoursToPay: number;
  ratePerHour: number;
}

