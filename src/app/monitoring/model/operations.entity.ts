import { BaseEntity } from '../../shared/model/base.entity';

export type OperationStatus = 'open' | 'closed';

export interface OperationsEntity extends BaseEntity {
  date: string; // Fecha en formato YYYY-MM-DD
  openTime?: string; // Hora de apertura
  closeTime?: string; // Hora de cierre
  status: OperationStatus;
  businessId?: string;
}

export interface VehicleDebtEntity extends BaseEntity {
  vehicleId: string;
  plate: string;
  vehicleType: 'auto-camioneta' | 'moto';
  entryDate: string;
  entryTime: string;
  regularHours: number; // Horas en horario de atención
  regularAmount: number; // Monto por horas regulares
  nightCharge: number; // Cargo nocturno
  totalDebt: number; // Deuda total acumulada
  isPaid: boolean;
  lastUpdated: string; // Fecha y hora de última actualización
  businessId?: string;
}
