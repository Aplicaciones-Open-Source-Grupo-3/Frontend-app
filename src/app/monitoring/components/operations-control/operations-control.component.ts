import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { OperationsService, OperationResource } from '../../services/operations.service';
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

  readonly currentOperation = signal<OperationResource | null>(null);
  readonly isLoading = signal(false);
  readonly vehiclesInParking = signal<number>(0);
  readonly vehiclesInsideList = signal<any[]>([]);
  readonly showConfirmModal = signal(false);
  readonly showDebtsModal = signal(false);
  readonly pendingDebts = signal<any[]>([]);
  readonly errorMessage = signal<string | null>(null);

  // Computed signals para reactividad
  readonly isOperationOpen = computed(() => {
    const operation = this.currentOperation();
    console.log('🔍 [isOperationOpen] Evaluando - operation:', operation);

    if (!operation) {
      console.log('🔍 [isOperationOpen] No hay operación, retornando false');
      return false;
    }

    // Normalizar el status a mayúsculas para comparación
    const status = operation.status?.toString().toUpperCase().trim();
    console.log('🔍 [isOperationOpen] Status normalizado:', `"${status}"`);
    console.log('🔍 [isOperationOpen] Comparando con "OPEN":', status === 'OPEN');

    const result = status === 'OPEN';
    console.log('🔍 [isOperationOpen] Resultado final:', result);
    return result;
  });

  readonly canStartOperations = computed(() => {
    const operation = this.currentOperation();
    if (!operation) return true;

    const status = operation.status?.toString().toUpperCase().trim();
    return status === 'CLOSED';
  });

  readonly canCloseOperations = computed(() => {
    const operation = this.currentOperation();
    console.log('🔴 [canCloseOperations] Evaluando - operation:', operation);

    if (!operation) {
      console.log('🔴 [canCloseOperations] No hay operación, retornando false');
      return false;
    }

    const status = operation.status?.toString().toUpperCase().trim();
    console.log('🔴 [canCloseOperations] Status normalizado:', `"${status}"`);
    console.log('🔴 [canCloseOperations] Comparando con "OPEN":', status === 'OPEN');

    const result = status === 'OPEN';
    console.log('🔴 [canCloseOperations] Resultado final:', result);
    return result;
  });

  ngOnInit(): void {
    this.loadCurrentOperation();
    this.loadVehiclesCount();
  }

  private loadCurrentOperation(): void {
    console.log('🔄 [loadCurrentOperation] Iniciando carga de operación...');

    this.operationsService.getTodayOperations().subscribe({
      next: (operation) => {
        console.log('🔄 [loadCurrentOperation] Respuesta recibida del backend:', operation);
        console.log('📊 [loadCurrentOperation] Status recibido:', operation.status);
        console.log('📊 [loadCurrentOperation] Status tipo:', typeof operation.status);
        console.log('📊 [loadCurrentOperation] Operación completa (JSON):', JSON.stringify(operation));

        // Normalizar el status a mayúsculas igual que en startOperations
        const normalizedOperation = {
          ...operation,
          status: operation.status?.toString().toUpperCase().trim()
        };

        console.log('🔄 [loadCurrentOperation] Operación normalizada:', normalizedOperation);

        this.currentOperation.set(normalizedOperation);
        this.errorMessage.set(null);

        // Forzar la evaluación de los computed signals después de un tick
        setTimeout(() => {
          console.log('✅ [loadCurrentOperation] Operación cargada:', this.currentOperation());
          console.log('🟢 [loadCurrentOperation] isOperationOpen():', this.isOperationOpen());
          console.log('🔴 [loadCurrentOperation] canCloseOperations():', this.canCloseOperations());
        }, 0);
      },
      error: (err) => {
        console.error('❌ [loadCurrentOperation] Error completo:', err);
        console.error('❌ [loadCurrentOperation] Status del error:', err.status);
        console.error('❌ [loadCurrentOperation] Mensaje del error:', err.message);

        // 404 es esperado cuando no hay operación hoy
        if (err.status === 404) {
          console.log('⚠️ [loadCurrentOperation] No hay operación para hoy (404)');
          this.currentOperation.set(null);
        } else if (err.status === 401) {
          console.error('🔒 [loadCurrentOperation] Error de autenticación (401) - Token inválido o expirado');
          this.errorMessage.set('Error de autenticación. Por favor, inicie sesión nuevamente.');
          // Aquí podrías redirigir al login si es necesario
        } else {
          console.error('💥 [loadCurrentOperation] Error inesperado:', err);
          this.errorMessage.set('Error al cargar operaciones');
        }
      }
    });
  }

  private loadVehiclesCount(): void {
    this.vehicleService.getVehicles().subscribe({
      next: (vehicles: any[]) => {
        const vehiclesInside = vehicles.filter((v: any) => v.status === 'INSIDE' || v.status === 'in-space');
        this.vehiclesInParking.set(vehiclesInside.length);
        this.vehiclesInsideList.set(vehiclesInside);
      },
      error: (err: any) => console.error('Error loading vehicles:', err)
    });
  }

  /**
   * Iniciar operaciones del día
   * Envía initialCash = 0.0 por defecto (puedes modificar para pedir el valor al usuario)
   */
  startOperations(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    // Por defecto usa 0.0, pero podrías mostrar un diálogo para ingresar el monto inicial
    const initialCash = 0.0;

    this.operationsService.startOperations(initialCash).subscribe({
      next: (operation) => {
        console.log('✅ Respuesta del backend al iniciar:', operation);
        console.log('📊 Estado de la operación:', operation.status);
        console.log('🔍 Tipo del status:', typeof operation.status);
        console.log('🔍 Status raw (JSON):', JSON.stringify(operation));

        // Guardar el operationId en localStorage
        localStorage.setItem('currentOperationId', operation.id.toString());
        console.log('💾 OperationId guardado en localStorage:', operation.id);

        // Forzar la actualización del signal con un objeto nuevo
        this.currentOperation.set({
          ...operation,
          status: operation.status?.toString().toUpperCase().trim()
        });

        this.isLoading.set(false);
        this.loadVehiclesCount();

        // Dar tiempo para que Angular detecte los cambios
        setTimeout(() => {
          console.log('🎯 currentOperation después de set:', this.currentOperation());
          console.log('🟢 isOperationOpen():', this.isOperationOpen());
          console.log('🔴 canCloseOperations():', this.canCloseOperations());
        }, 100);
      },
      error: (err) => {
        console.error('❌ Error al iniciar operaciones:', err);
        this.isLoading.set(false);

        // Mostrar mensaje de error al usuario
        const errorMsg = err.error?.message || 'Error al iniciar operaciones';
        this.errorMessage.set(errorMsg);
        alert(errorMsg);
      }
    });
  }

  /**
   * Solicitar confirmación antes de cerrar operaciones
   */
  requestCloseOperations(): void {
    this.loadVehiclesCount(); // Actualizar lista de vehículos antes de mostrar modal
    this.showConfirmModal.set(true);
  }

  /**
   * Confirmar cierre de operaciones
   * Envía finalCash = 0.0 y notes por defecto (puedes modificar para pedir estos valores)
   */
  confirmCloseOperations(): void {
    this.showConfirmModal.set(false);
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const currentOp = this.currentOperation();

    if (!currentOp || !currentOp.id) {
      alert('No se puede cerrar: no hay una operación activa');
      this.isLoading.set(false);
      return;
    }

    // Por defecto usa valores básicos, pero podrías mostrar un formulario
    const finalCash = 0.0;
    const notes = 'Operación cerrada';

    // Usar closeOperationById con el ID de la operación actual
    this.operationsService.closeOperationById(currentOp.id.toString(), finalCash, notes).subscribe({
      next: (operation) => {
        console.log('✅ Operaciones cerradas:', operation);

        // Forzar la actualización del signal con un objeto nuevo
        this.currentOperation.set({
          ...operation,
          status: operation.status?.toString().toUpperCase() as 'OPEN' | 'CLOSED'
        });

        this.isLoading.set(false);
        this.loadVehiclesCount();

        // Mostrar mensaje de éxito
        alert('Operaciones cerradas exitosamente');
      },
      error: (err) => {
        console.error('❌ Error al cerrar operaciones:', err);
        this.isLoading.set(false);

        // Mostrar mensaje de error al usuario
        const errorMsg = err.error?.message || 'Error al cerrar operaciones';
        this.errorMessage.set(errorMsg);
        alert(errorMsg);
      }
    });
  }

  cancelCloseOperations(): void {
    this.showConfirmModal.set(false);
  }

  closeDebtsModal(): void {
    this.showDebtsModal.set(false);
  }
}
