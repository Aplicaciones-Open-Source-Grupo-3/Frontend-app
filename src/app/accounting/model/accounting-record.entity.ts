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
  operationDate?: string; // Fecha de operación en formato YYYY-MM-DD
  nightCharge?: number; // Cargo nocturno si aplica
  debtId?: string; // ID de la deuda asociada si existía
}
