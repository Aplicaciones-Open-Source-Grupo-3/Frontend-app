import { Injectable } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { VehicleEntity } from '../model/vehicle.entity';
import { ExitCalculation } from '../model/exit-calculation.entity';
import { ParkingSettingsService } from '../../profiles/services/parking-settings.service';

@Injectable({ providedIn: 'root' })
export class VehicleExitService {
  constructor(private settingsService: ParkingSettingsService) {}

  calculateExit(vehicle: VehicleEntity): Observable<ExitCalculation> {
    return this.settingsService.getSettings().pipe(
      map(settings => {
        const now = new Date();
        const exitDate = this.formatDate(now);
        const exitTime = this.formatTime(now);

        // Calcular horas estacionado
        const entryDateTime = this.parseDateTime(vehicle.entryDate, vehicle.entryTime);
        const exitDateTime = now;
        const milliseconds = exitDateTime.getTime() - entryDateTime.getTime();
        const hoursParked = milliseconds / (1000 * 60 * 60);

        // El pago mínimo es siempre 1 hora
        let hoursToPay = Math.max(1, Math.ceil(hoursParked));

        // Obtener tarifa según tipo de vehículo
        const ratePerHour = vehicle.vehicleType === 'moto'
          ? settings.motorcycleRate
          : settings.carTruckRate;

        const totalAmount = hoursToPay * ratePerHour;

        // Formatear tipo de vehículo para mostrar
        const vehicleTypeDisplay = vehicle.vehicleType === 'moto'
          ? 'Moto'
          : 'Auto/Camioneta';

        return {
          vehicleId: vehicle.id,
          plate: vehicle.plate,
          vehicleType: vehicleTypeDisplay,
          entryDate: vehicle.entryDate,
          entryTime: vehicle.entryTime,
          exitDate,
          exitTime,
          hoursParked,
          hoursParkedFormatted: this.formatHoursToReadable(hoursParked),
          hoursToPay,
          ratePerHour,
          totalAmount,
          currency: this.getCurrencySymbol(settings.currency)
        };
      })
    );
  }

  private formatHoursToReadable(hours: number): string {
    const totalMinutes = Math.floor(hours * 60);
    const h = Math.floor(totalMinutes / 60);
    const min = totalMinutes % 60;

    if (h === 0) {
      return `${min}min`;
    } else if (min === 0) {
      return `${h}h`;
    } else {
      return `${h}h ${min}min`;
    }
  }

  private parseDateTime(date: string, time: string): Date {
    // Formato de fecha: DD-MM-YYYY
    // Formato de hora: HH:MM
    const [day, month, year] = date.split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);
    return new Date(year, month - 1, day, hours, minutes);
  }

  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  private formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  private getCurrencySymbol(currency: string): string {
    const symbols: { [key: string]: string } = {
      'PEN': 'S/',
      'USD': '$',
      'EUR': '€'
    };
    return symbols[currency] || currency;
  }
}
