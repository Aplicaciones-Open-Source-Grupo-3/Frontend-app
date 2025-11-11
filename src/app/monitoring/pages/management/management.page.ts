import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { VehicleService } from '../../services/vehicle.service';
import { VehicleEntity } from '../../model/vehicle.entity';
import { VehicleTableComponent } from '../../components/vehicle-table/vehicle-table.component';
import { AddVehicleModalComponent } from '../../components/add-vehicle-modal/add-vehicle-modal.component';
import { VehicleExitModalComponent } from '../../components/vehicle-exit-modal/vehicle-exit-modal.component';
import { VehicleExitService } from '../../services/vehicle-exit.service';
import { ExitCalculation } from '../../model/exit-calculation.entity';
import { ParkingCapacityService, ParkingCapacity } from '../../../profiles/services/parking-capacity.service';
import { AccountingService } from '../../../accounting/services/accounting.service';
import { AccountingRecord } from '../../../accounting/model/accounting-record.entity';

@Component({
  selector: 'app-monitoring-management-page',
  standalone: true,
  imports: [AsyncPipe, NgIf, TranslateModule, FormsModule, VehicleTableComponent, AddVehicleModalComponent, VehicleExitModalComponent],
  templateUrl: './management.page.html',
  styleUrls: ['./management.page.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MonitoringManagementPageComponent {
  private readonly vehicleService = inject(VehicleService);
  private readonly exitService = inject(VehicleExitService);
  private readonly capacityService = inject(ParkingCapacityService);
  private readonly accountingService = inject(AccountingService);

  readonly showForm = signal(false);
  readonly exitCalculation = signal<ExitCalculation | null>(null);
  readonly searchPlate = signal('');

  vehicles$: Observable<VehicleEntity[]> = this.getVehiclesSorted();
  filteredVehicles$: Observable<VehicleEntity[]> = this.vehicles$;
  capacity$: Observable<ParkingCapacity> = this.capacityService.getCapacity();

  toggleForm(): void {
    this.showForm.update(value => !value);
  }

  onSearchChange(plate: string): void {
    this.searchPlate.set(plate);
    this.filterVehicles();
  }

  private filterVehicles(): void {
    const searchTerm = this.searchPlate().trim().toUpperCase();

    if (searchTerm === '') {
      this.filteredVehicles$ = this.vehicles$;
    } else {
      this.filteredVehicles$ = this.vehicles$.pipe(
        map(vehicles => vehicles.filter(vehicle =>
          vehicle.plate.toUpperCase().includes(searchTerm)
        ))
      );
    }
  }

  onVehicleAdded(): void {
    this.vehicles$ = this.getVehiclesSorted();
    this.filterVehicles();
    this.showForm.set(false);
    this.refreshCapacity();
  }

  onVehicleExit(id: number | string): void {
    // Buscar el vehículo y calcular la salida
    this.vehicles$.subscribe(vehicles => {
      const vehicle = vehicles.find(v => v.id === id);
      if (vehicle) {
        this.exitService.calculateExit(vehicle).subscribe(calculation => {
          this.exitCalculation.set(calculation);
        });
      }
    });
  }

  onCancelExit(): void {
    this.exitCalculation.set(null);
  }

  onConfirmExit(id: number | string): void {
    // Obtener el cálculo actual de salida
    const calculation = this.exitCalculation();
    if (!calculation) return;

    console.log('🚗 Registrando salida del vehículo:', id);
    console.log('💰 Monto a pagar:', calculation.totalAmount);

    // Registrar la salida del vehículo con el monto pagado
    this.vehicleService.registerExit(id, calculation.totalAmount).subscribe({
      next: (response) => {
        console.log('✅ Salida registrada correctamente:', response);

        // Limpiar el cálculo de salida
        this.exitCalculation.set(null);

        // Refrescar la lista de vehículos y capacidad
        this.vehicles$ = this.getVehiclesSorted();
        this.filterVehicles();
        this.refreshCapacity();
      },
      error: (err) => {
        console.error('❌ Error al registrar salida:', err);
        alert(`Error al registrar la salida: ${err.error?.message || 'Error desconocido'}`);
      }
    });
  }

  private refreshCapacity(): void {
    this.capacity$ = this.capacityService.getCapacity();
  }

  private getVehiclesSorted(): Observable<VehicleEntity[]> {
    return this.vehicleService.getVehicles().pipe(
      map(vehicles => vehicles.sort((a, b) => {
        const numA = parseInt(a.registrationNumber, 10);
        const numB = parseInt(b.registrationNumber, 10);
        return numB - numA;
      }))
    );
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
}
