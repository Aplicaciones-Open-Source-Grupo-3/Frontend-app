import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface OperationResource {
  id: string | number; // Puede ser string o number
  date: string;
  openTime: string;
  closeTime: string | null;
  status: string; // Cambiar a string genérico para aceptar cualquier formato
  businessId: string | number;
}

export interface StartOperationRequest {
  initialCash?: number;
}

export interface CloseOperationRequest {
  finalCash?: number;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class OperationsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1/parking/operations`;

  /**
   * Iniciar operaciones del día
   * @param initialCash - Efectivo inicial en caja (opcional, default: 0.0)
   */
  startOperations(initialCash: number = 0.0): Observable<OperationResource> {
    const body: StartOperationRequest = { initialCash };
    return this.http.post<OperationResource>(`${this.baseUrl}/start`, body);
  }

  /**
   * Cerrar operaciones del día actual (busca automáticamente la operación abierta)
   * @param finalCash - Efectivo final en caja (opcional, default: 0.0)
   * @param notes - Notas del cierre (opcional, default: "Operación cerrada")
   */
  closeOperations(finalCash: number = 0.0, notes: string = 'Operación cerrada'): Observable<OperationResource> {
    const body: CloseOperationRequest = { finalCash, notes };
    return this.http.post<OperationResource>(`${this.baseUrl}/close`, body);
  }

  /**
   * Cerrar operación específica por ID
   * @param operationId - ID de la operación a cerrar
   * @param finalCash - Efectivo final en caja (opcional)
   * @param notes - Notas del cierre (opcional)
   */
  closeOperationById(operationId: string, finalCash: number = 0.0, notes: string = 'Operación cerrada'): Observable<OperationResource> {
    const body: CloseOperationRequest = { finalCash, notes };
    return this.http.post<OperationResource>(`${this.baseUrl}/${operationId}/close`, body);
  }

  /**
   * Obtener operación por ID
   * @param operationId - ID de la operación
   */
  getOperationById(operationId: string | number): Observable<OperationResource> {
    return this.http.get<OperationResource>(`${this.baseUrl}/${operationId}`);
  }

  /**
   * Obtener la operación de hoy desde el historial
   * Como el endpoint /today está defectuoso, obtenemos el historial y buscamos la de hoy
   */
  getTodayOperations(): Observable<OperationResource> {
    return new Observable(observer => {
      // Primero intentar obtener del localStorage
      const savedOperationId = localStorage.getItem('currentOperationId');

      if (savedOperationId) {
        // Si hay un ID guardado, obtener esa operación
        this.getOperationById(savedOperationId).subscribe({
          next: (operation) => {
            const today = new Date().toISOString().split('T')[0]; // formato YYYY-MM-DD

            // Verificar que sea de hoy
            if (operation.date === today) {
              observer.next(operation);
              observer.complete();
            } else {
              // Si no es de hoy, limpiar localStorage y buscar en historial
              localStorage.removeItem('currentOperationId');
              this.findTodayOperationFromHistory(observer);
            }
          },
          error: () => {
            // Si falla, limpiar localStorage y buscar en historial
            localStorage.removeItem('currentOperationId');
            this.findTodayOperationFromHistory(observer);
          }
        });
      } else {
        // Si no hay ID guardado, buscar en historial
        this.findTodayOperationFromHistory(observer);
      }
    });
  }

  /**
   * Buscar la operación de hoy en el historial
   */
  private findTodayOperationFromHistory(observer: any): void {
    this.getOperationsHistory().subscribe({
      next: (operations) => {
        const today = new Date().toISOString().split('T')[0]; // formato YYYY-MM-DD
        const todayOperation = operations.find(op => op.date === today);

        if (todayOperation) {
          // Guardar el ID en localStorage para futuras consultas
          localStorage.setItem('currentOperationId', todayOperation.id.toString());
          observer.next(todayOperation);
          observer.complete();
        } else {
          // No hay operación para hoy
          observer.error({ status: 404, message: 'No hay operación para hoy' });
        }
      },
      error: (err) => {
        observer.error(err);
      }
    });
  }

  /**
   * Historial de operaciones del negocio
   * Retorna array vacío si no hay operaciones
   */
  getOperationsHistory(): Observable<OperationResource[]> {
    return this.http.get<OperationResource[]>(this.baseUrl);
  }

  /**
   * Verificar si hay una operación abierta actualmente
   */
  checkIfOperationIsOpen(): Observable<boolean> {
    return new Observable(observer => {
      this.getTodayOperations().subscribe({
        next: (operation) => {
          observer.next(operation?.status === 'OPEN');
          observer.complete();
        },
        error: () => {
          // 404 significa que no hay operación hoy
          observer.next(false);
          observer.complete();
        }
      });
    });
  }
}
