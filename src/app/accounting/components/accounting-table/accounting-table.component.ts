import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AccountingRecord } from '../../model/accounting-record.entity';

@Component({
  selector: 'app-accounting-table',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './accounting-table.component.html',
  styleUrls: ['./accounting-table.component.css']
})
export class AccountingTableComponent {
  readonly records = input.required<AccountingRecord[]>();

  /**
   * Verifica si el tipo de vehículo es una motocicleta
   * Soporta: MOTORCYCLE (backend) y moto (legacy)
   */
  isMotorcycle(vehicleType: string): boolean {
    const type = vehicleType?.toString().toUpperCase();
    return type === 'MOTORCYCLE' || type === 'MOTO';
  }

  /**
   * Verifica si el tipo de vehículo es un auto o camioneta
   * Soporta: CAR, TRUCK (backend) y auto-camioneta (legacy)
   */
  isCarOrTruck(vehicleType: string): boolean {
    const type = vehicleType?.toString().toUpperCase();
    return type === 'CAR' || type === 'TRUCK' || type === 'AUTO-CAMIONETA';
  }

  /**
   * Obtiene la etiqueta de traducción según el tipo de vehículo
   */
  getVehicleTypeLabel(vehicleType: string): string {
    return this.isMotorcycle(vehicleType)
      ? 'ACCOUNTING.TABLE.MOTORCYCLE'
      : 'ACCOUNTING.TABLE.CAR_TRUCK';
  }
}
