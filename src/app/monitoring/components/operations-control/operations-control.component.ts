import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { OperationsService } from '../../services/operations.service';
import { OperationsEntity, VehicleDebtEntity } from '../../model/operations.entity';
import { VehicleService } from '../../services/vehicle.service';

@Component({
  selector: 'app-operations-control',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './operations-control.component.html',
  styleUrls: ['./operations-control.component.css']
})
export class OperationsControlComponent implements OnInit {
  private readonly operationsService = inject(OperationsService);
  private readonly vehicleService = inject(VehicleService);

  readonly currentOperation = signal<OperationsEntity | null>(null);
  readonly isLoading = signal(false);
  readonly vehiclesInParking = signal<number>(0);
  readonly vehiclesInsideList = signal<any[]>([]);
  readonly showConfirmModal = signal(false);
  readonly showDebtsModal = signal(false);
  readonly pendingDebts = signal<VehicleDebtEntity[]>([]);

  ngOnInit(): void {
    this.loadCurrentOperation();
    this.loadVehiclesCount();
  }

  private loadCurrentOperation(): void {
    this.operationsService.getTodayOperations().subscribe({
      next: (operation) => this.currentOperation.set(operation),
      error: (err) => console.error('Error loading operations:', err)
    });
  }

  private loadVehiclesCount(): void {
    this.vehicleService.getVehicles().subscribe({
      next: (vehicles) => {
        const vehiclesInside = vehicles.filter(v => v.status === 'in-space');
        this.vehiclesInParking.set(vehiclesInside.length);
        this.vehiclesInsideList.set(vehiclesInside);
      },
      error: (err) => console.error('Error loading vehicles:', err)
    });
  }

  startOperations(): void {
    this.isLoading.set(true);
    this.operationsService.startOperations().subscribe({
      next: (operation) => {
        this.currentOperation.set(operation);
        this.isLoading.set(false);
        this.loadVehiclesCount(); // Actualizar conteo
      },
      error: (err) => {
        console.error('Error starting operations:', err);
        this.isLoading.set(false);
      }
    });
  }

  requestCloseOperations(): void {
    this.loadVehiclesCount(); // Actualizar lista de vehículos antes de mostrar modal
    this.showConfirmModal.set(true);
  }

  confirmCloseOperations(): void {
    this.showConfirmModal.set(false);
    this.isLoading.set(true);

    this.operationsService.closeOperations().subscribe({
      next: ({ operation, debts }) => {
        this.currentOperation.set(operation);
        this.pendingDebts.set(debts);
        this.isLoading.set(false);
        this.loadVehiclesCount(); // Actualizar conteo después de cerrar

        // Si se generaron deudas, mostrar el modal informativo
        if (debts.length > 0) {
          this.showDebtsModal.set(true);
        }
      },
      error: (err) => {
        console.error('Error closing operations:', err);
        this.isLoading.set(false);
      }
    });
  }

  cancelCloseOperations(): void {
    this.showConfirmModal.set(false);
  }

  closeDebtsModal(): void {
    this.showDebtsModal.set(false);
  }

  get isOperationOpen(): boolean {
    return this.currentOperation()?.status === 'open';
  }

  get canStartOperations(): boolean {
    const operation = this.currentOperation();
    return !operation || operation.status === 'closed';
  }

  get canCloseOperations(): boolean {
    return this.currentOperation()?.status === 'open';
  }
}
