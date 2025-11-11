import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { VehicleEntity } from '../model/vehicle.entity';

interface VehicleTimeCache {
  [vehicleId: string]: {
    entryDate: string;
    entryTime: string;
  };
}

@Injectable({ providedIn: 'root' })
export class VehicleService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1/parking/vehicles`;
  private readonly CACHE_KEY = 'vehicleTimesCache';

  // Listar todos los vehículos del negocio
  getVehicles(): Observable<VehicleEntity[]> {
    return this.http.get<any[]>(this.baseUrl).pipe(
      tap(vehicles => console.log('📥 Vehículos recibidos del backend:', vehicles)),
      map(vehicles => vehicles.map(v => this.mapVehicleFromBackend(v)))
    );
  }

  // Listar solo vehículos dentro del estacionamiento
  getVehiclesInside(): Observable<VehicleEntity[]> {
    return this.http.get<any[]>(`${this.baseUrl}/inside`).pipe(
      tap(vehicles => console.log('📥 Vehículos INSIDE recibidos:', vehicles)),
      map(vehicles => vehicles.map(v => this.mapVehicleFromBackend(v)))
    );
  }

  // Obtener vehículo por ID
  getVehicleById(id: number | string): Observable<VehicleEntity> {
    return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(
      tap(v => console.log('📥 Vehículo individual recibido:', v)),
      map(v => this.mapVehicleFromBackend(v))
    );
  }

  // Registrar entrada de vehículo
  registerEntry(vehicleData: {
    licensePlate: string;
    vehicleType: 'MOTORCYCLE' | 'CAR' | 'TRUCK';
  }): Observable<VehicleEntity> {
    return this.http.post<any>(`${this.baseUrl}/entry`, vehicleData).pipe(
      tap(v => console.log('📥 Vehículo registrado (respuesta del backend):', v)),
      map(v => this.mapVehicleFromBackend(v, true)) // true = es un nuevo registro
    );
  }

  // Registrar salida de vehículo (incluye cálculo de pago)
  registerExit(vehicleId: number | string, amountPaid: number): Observable<any> {
    // NO eliminar del cache - mantener la hora de entrada para vehículos que han salido
    console.log('🚪 Registrando salida del vehículo', vehicleId, '- manteniendo hora de entrada en cache');
    return this.http.post<any>(`${this.baseUrl}/${vehicleId}/exit`, { amountPaid });
  }

  // Eliminar vehículo
  deleteVehicle(id: number | string): Observable<void> {
    // Solo eliminar del cache si se elimina completamente el vehículo
    this.removeFromCache(id.toString());
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Métodos de compatibilidad con el código existente
  addVehicle(vehicle: Partial<VehicleEntity>): Observable<VehicleEntity> {
    return this.registerEntry({
      licensePlate: vehicle.plate!,
      vehicleType: this.mapVehicleTypeToBackend(vehicle.vehicleType!)
    });
  }

  updateVehicle(id: number | string, data: Partial<VehicleEntity>): Observable<VehicleEntity> {
    return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(
      map(v => this.mapVehicleFromBackend(v))
    );
  }

  // Obtener cache de tiempos guardados
  private getTimeCache(): VehicleTimeCache {
    try {
      const cache = localStorage.getItem(this.CACHE_KEY);
      return cache ? JSON.parse(cache) : {};
    } catch (error) {
      console.error('Error al leer cache de tiempos:', error);
      return {};
    }
  }

  // Guardar tiempo de entrada en cache
  private saveToCache(vehicleId: string, entryDate: string, entryTime: string): void {
    try {
      const cache = this.getTimeCache();
      cache[vehicleId] = { entryDate, entryTime };
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
      console.log('💾 Guardado en cache:', vehicleId, entryDate, entryTime);
    } catch (error) {
      console.error('Error al guardar en cache:', error);
    }
  }

  // Obtener tiempo de entrada desde cache
  private getFromCache(vehicleId: string): { entryDate: string; entryTime: string } | null {
    const cache = this.getTimeCache();
    return cache[vehicleId] || null;
  }

  // Eliminar del cache
  private removeFromCache(vehicleId: string): void {
    try {
      const cache = this.getTimeCache();
      delete cache[vehicleId];
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
      console.log('🗑️ Eliminado del cache:', vehicleId);
    } catch (error) {
      console.error('Error al eliminar del cache:', error);
    }
  }

  // Mapear vehículo del backend al formato del frontend
  private mapVehicleFromBackend(vehicle: any, isNewEntry: boolean = false): VehicleEntity {
    console.log('🔍 Mapeando vehículo - Datos crudos:', {
      id: vehicle.id,
      entryDate: vehicle.entryDate,
      entryDateType: typeof vehicle.entryDate,
      createdAt: vehicle.createdAt,
      status: vehicle.status,
      isNewEntry
    });

    const vehicleId = vehicle.id.toString();

    // Determinar la fecha de entrada correcta
    let entryDate: Date;
    let formattedDate: string;
    let formattedTime: string;

    // Primero, verificar si ya tenemos este vehículo en cache
    const cachedTime = this.getFromCache(vehicleId);
    const isVehicleOut = vehicle.status === 'OUT' || vehicle.status === 'out';

    if (cachedTime) {
      // SIEMPRE usar tiempo del cache si existe, incluso si el vehículo ya salió
      console.log('📦 Usando tiempo desde cache para vehículo', vehicleId, '- Status:', vehicle.status);
      formattedDate = cachedTime.entryDate;
      formattedTime = cachedTime.entryTime;

      // Reconstruir el Date para otros cálculos si es necesario
      const [day, month, year] = cachedTime.entryDate.split('-').map(Number);
      const [hours, minutes] = cachedTime.entryTime.split(':').map(Number);
      entryDate = new Date(year, month - 1, day, hours, minutes);
    } else {
      // Si es un nuevo registro o no está en cache, determinar la hora
      if (vehicle.entryDate) {
        if (Array.isArray(vehicle.entryDate)) {
          console.log('📅 entryDate es un array:', vehicle.entryDate);
          const [year, month, day, hour = 0, minute = 0, second = 0] = vehicle.entryDate;
          entryDate = new Date(year, month - 1, day, hour, minute, second);
        } else if (typeof vehicle.entryDate === 'string') {
          console.log('📅 entryDate es un string:', vehicle.entryDate);

          const dateOnlyPattern = /^\d{2}-\d{2}-\d{4}$/;

          if (dateOnlyPattern.test(vehicle.entryDate)) {
            // Si es solo fecha sin hora, usar la hora actual SOLO para nuevos registros
            if (isNewEntry) {
              console.log('⚠️ Nuevo vehículo - usando hora actual');
              const [day, month, year] = vehicle.entryDate.split('-').map(Number);
              const now = new Date();
              entryDate = new Date(year, month - 1, day, now.getHours(), now.getMinutes(), now.getSeconds());
            } else {
              // Para vehículos existentes sin cache, usar medianoche como fallback
              console.log('⚠️ Vehículo existente sin cache - usando medianoche');
              const [day, month, year] = vehicle.entryDate.split('-').map(Number);
              entryDate = new Date(year, month - 1, day, 0, 0, 0);
            }
          } else {
            entryDate = new Date(vehicle.entryDate);
          }
        } else {
          entryDate = new Date(vehicle.entryDate);
        }
      } else if (vehicle.createdAt) {
        console.log('⚠️ usando createdAt:', vehicle.createdAt);
        if (Array.isArray(vehicle.createdAt)) {
          const [year, month, day, hour = 0, minute = 0, second = 0] = vehicle.createdAt;
          entryDate = new Date(year, month - 1, day, hour, minute, second);
        } else {
          entryDate = new Date(vehicle.createdAt);
        }
      } else {
        console.log('❌ No hay entryDate ni createdAt, usando fecha actual');
        entryDate = new Date();
      }

      console.log('✅ entryDate parseado:', entryDate.toISOString(), 'Hora local:', entryDate.toLocaleString());

      formattedDate = this.formatDate(entryDate);
      formattedTime = this.formatTime(entryDate);

      // Guardar en cache si no tenía cache previo (independiente del estado)
      if (!cachedTime) {
        this.saveToCache(vehicleId, formattedDate, formattedTime);
      }
    }

    const exitDate = vehicle.exitDate ?
      (Array.isArray(vehicle.exitDate) ?
        new Date(vehicle.exitDate[0], vehicle.exitDate[1] - 1, vehicle.exitDate[2], vehicle.exitDate[3] || 0, vehicle.exitDate[4] || 0, vehicle.exitDate[5] || 0) :
        new Date(vehicle.exitDate)) :
      null;

    // Determinar el estado correcto
    let status: 'in-space' | 'out';
    if (vehicle.status) {
      status = (vehicle.status === 'INSIDE' || vehicle.status === 'in-space') ? 'in-space' : 'out';
    } else {
      status = exitDate ? 'out' : 'in-space';
    }

    console.log('✨ Resultado final del mapeo:', {
      vehicleId: vehicle.id,
      plate: vehicle.licensePlate,
      entryDate: formattedDate,
      entryTime: formattedTime,
      status: status,
      source: cachedTime ? 'cache' : 'calculado'
    });

    return {
      id: vehicle.id,
      registrationNumber: vehicle.registrationNumber || vehicle.id?.toString() || '',
      entryDate: formattedDate,
      entryTime: formattedTime,
      vehicleType: this.mapVehicleTypeFromBackend(vehicle.vehicleType),
      plate: vehicle.licensePlate || vehicle.plate || '',
      status: status,
      exitDate: exitDate ? this.formatDate(exitDate) : undefined,
      exitTime: exitDate ? this.formatTime(exitDate) : undefined,
      businessId: vehicle.businessId?.toString()
    };
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

  private mapVehicleTypeFromBackend(type: string): 'auto-camioneta' | 'moto' {
    if (type === 'MOTORCYCLE') return 'moto';
    return 'auto-camioneta';
  }

  private mapVehicleTypeToBackend(type: string): 'MOTORCYCLE' | 'CAR' | 'TRUCK' {
    if (type === 'moto') return 'MOTORCYCLE';
    if (type === 'auto-camioneta') return 'CAR';
    return 'CAR';
  }
}

