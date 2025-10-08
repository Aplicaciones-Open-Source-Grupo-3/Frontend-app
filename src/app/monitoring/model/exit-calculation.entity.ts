export interface ExitCalculation {
  vehicleId: number | string;
  plate: string;
  vehicleType: string;
  entryDate: string;
  entryTime: string;
  exitDate: string;
  exitTime: string;
  hoursParked: number;
  hoursParkedFormatted: string;
  hoursToPay: number;
  ratePerHour: number;
  totalAmount: number;
  currency: string;
}
