import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { VehicleEntity } from '../model/vehicle.entity';

@Injectable({ providedIn: 'root' })
export class VehicleService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1/parking/vehicles`;

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
      map(v => this.mapVehicleFromBackend(v))
    );
  }

  // Registrar salida de vehículo (incluye cálculo de pago)
  registerExit(vehicleId: number | string, amountPaid: number): Observable<any> {
    console.log('🚪 Registrando salida del vehículo', vehicleId);
    return this.http.post<any>(`${this.baseUrl}/${vehicleId}/exit`, { amountPaid });
  }

  // Eliminar vehículo
  deleteVehicle(id: number | string): Observable<void> {
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

  // Mapear vehículo del backend al formato del frontend
  private mapVehicleFromBackend(vehicle: any): VehicleEntity {
    console.log('🔍 Mapeando vehículo desde backend - Datos completos:', vehicle);
    console.log('🔍 Status recibido (raw):', vehicle.status, '- Tipo:', typeof vehicle.status);

    // Usar directamente los datos que vienen del backend
    // Mapear el status del backend al formato del frontend
    let status: 'in-space' | 'out';

    if (vehicle.status) {
      const backendStatus = vehicle.status.toString().toUpperCase().trim();
      console.log('🔍 Status procesado (uppercase):', backendStatus);

      // IN, INSIDE, IN_SPACE -> 'in-space'
      // OUT, OUTSIDE -> 'out'
      if (backendStatus === 'IN' || backendStatus === 'INSIDE' || backendStatus === 'IN_SPACE' || backendStatus === 'IN-SPACE') {
        status = 'in-space';
        console.log('✅ Mapeado a: in-space');
      } else if (backendStatus === 'OUT' || backendStatus === 'OUTSIDE') {
        status = 'out';
        console.log('✅ Mapeado a: out');
      } else {
        // Valor inesperado, usar fallback
        console.warn('⚠️ Status inesperado:', backendStatus, '- Usando fallback');
        status = (vehicle.exitDate || vehicle.exitTime) ? 'out' : 'in-space';
        console.log('✅ Fallback mapeado a:', status);
      }
    } else {
      // Si no hay status, determinar por la existencia de exitDate/exitTime
      status = (vehicle.exitDate || vehicle.exitTime) ? 'out' : 'in-space';
      console.log('ℹ️ No hay status, determinado por exitDate/exitTime:', status);
    }

    const mapped: VehicleEntity = {
      id: vehicle.id,
      registrationNumber: vehicle.registrationNumber || vehicle.id?.toString() || '',
      entryDate: vehicle.entryDate || '',
      entryTime: vehicle.entryTime || '',
      vehicleType: this.mapVehicleTypeFromBackend(vehicle.vehicleType),
      plate: vehicle.plate || '',
      status: status,
      exitDate: vehicle.exitDate || undefined,
      exitTime: vehicle.exitTime || undefined,
      businessId: vehicle.businessId?.toString()
    };

    console.log('✨ Vehículo mapeado final:', {
      id: mapped.id,
      plate: mapped.plate,
      status: mapped.status,
      entryDate: mapped.entryDate,
      entryTime: mapped.entryTime,
      exitDate: mapped.exitDate,
      exitTime: mapped.exitTime
    });

    return mapped;
  }

  private mapVehicleTypeFromBackend(type: string): 'auto-camioneta' | 'moto' {
    if (type === 'MOTORCYCLE' || type === 'moto') return 'moto';
    return 'auto-camioneta';
  }

  private mapVehicleTypeToBackend(type: string): 'MOTORCYCLE' | 'CAR' | 'TRUCK' {
    if (type === 'moto') return 'MOTORCYCLE';
    if (type === 'auto-camioneta') return 'CAR';
    return 'CAR';
  }
}
