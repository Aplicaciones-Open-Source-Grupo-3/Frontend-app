import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ParkingSettingsEntity } from '../model/parking-settings.entity';

@Injectable({ providedIn: 'root' })
export class ParkingSettingsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1/parking/settings`;

  /**
   * Obtener configuración del estacionamiento desde el backend
   * GET /api/v1/parking/settings
   */
  getSettings(): Observable<ParkingSettingsEntity> {
    console.log('🔄 Cargando configuración desde el backend...');

    return this.http.get<any>(this.baseUrl).pipe(
      map(response => {
        // Mapear businessId a id para compatibilidad con la entidad
        const settings: ParkingSettingsEntity = {
          id: response.businessId || 1,
          maxCapacity: response.maxCapacity,
          motorcycleRate: response.motorcycleRate,
          carTruckRate: response.carTruckRate,
          nightRate: response.nightRate,
          openingTime: response.openingTime,
          closingTime: response.closingTime,
          currency: response.currency,
          gracePeriodMinutes: response.gracePeriodMinutes,
          allowOvernight: response.allowOvernight
        };
        return settings;
      }),
      tap(settings => {
        console.log('✅ Configuración cargada desde el backend:', settings);

        // Actualizar localStorage con la configuración actual del backend
        const authDataStr = localStorage.getItem('authUser');
        if (authDataStr) {
          try {
            const authData = JSON.parse(authDataStr);
            authData.maxCapacity = settings.maxCapacity;
            authData.motorcycleRate = settings.motorcycleRate;
            authData.carTruckRate = settings.carTruckRate;
            authData.nightRate = settings.nightRate;
            authData.openingTime = settings.openingTime;
            authData.closingTime = settings.closingTime;
            authData.currency = settings.currency;
            localStorage.setItem('authUser', JSON.stringify(authData));
          } catch (error) {
            console.error('Error al actualizar localStorage:', error);
          }
        }
      }),
      catchError(error => {
        console.error('❌ Error al cargar configuración del backend:', error);

        // Si falla, intentar cargar desde localStorage como fallback
        const authDataStr = localStorage.getItem('authUser');
        if (authDataStr) {
          try {
            const authData = JSON.parse(authDataStr);
            const fallbackSettings: ParkingSettingsEntity = {
              id: authData.businessId || 1,
              maxCapacity: authData.maxCapacity || 50,
              motorcycleRate: authData.motorcycleRate || 5.0,
              carTruckRate: authData.carTruckRate || 10.0,
              nightRate: authData.nightRate || 8.0,
              openingTime: authData.openingTime || '08:00',
              closingTime: authData.closingTime || '22:00',
              currency: authData.currency || 'PEN',
              gracePeriodMinutes: 15,
              allowOvernight: true
            };
            console.log('⚠️ Usando configuración de fallback desde localStorage');
            return of(fallbackSettings);
          } catch (parseError) {
            console.error('Error al parsear localStorage:', parseError);
          }
        }

        // Si todo falla, retornar valores por defecto
        const defaultSettings: ParkingSettingsEntity = {
          id: 1,
          maxCapacity: 50,
          motorcycleRate: 5.0,
          carTruckRate: 10.0,
          nightRate: 8.0,
          openingTime: '08:00',
          closingTime: '22:00',
          currency: 'PEN',
          gracePeriodMinutes: 15,
          allowOvernight: true
        };
        console.log('⚠️ Usando configuración por defecto');
        return of(defaultSettings);
      })
    );
  }

  /**
   * Crear o actualizar configuración del estacionamiento
   * POST /api/v1/parking/settings
   *
   * El backend maneja automáticamente si es creación o actualización:
   * - Si no existe configuración para el negocio → CREA nueva
   * - Si ya existe → ACTUALIZA la existente
   */
  updateSettings(settings: Partial<ParkingSettingsEntity>): Observable<ParkingSettingsEntity> {
    console.log('💾 Guardando configuración del parking:', settings);

    // Preparar el payload para el backend (sin el id)
    const payload = {
      openingTime: settings.openingTime,
      closingTime: settings.closingTime,
      motorcycleRate: settings.motorcycleRate,
      carTruckRate: settings.carTruckRate,
      nightRate: settings.nightRate,
      maxCapacity: settings.maxCapacity,
      currency: settings.currency,
      gracePeriodMinutes: settings.gracePeriodMinutes,
      allowOvernight: settings.allowOvernight
    };

    return this.http.post<any>(this.baseUrl, payload).pipe(
      map(response => {
        // Mapear businessId a id para compatibilidad
        const mappedSettings: ParkingSettingsEntity = {
          id: response.businessId || 1,
          maxCapacity: response.maxCapacity,
          motorcycleRate: response.motorcycleRate,
          carTruckRate: response.carTruckRate,
          nightRate: response.nightRate,
          openingTime: response.openingTime,
          closingTime: response.closingTime,
          currency: response.currency,
          gracePeriodMinutes: response.gracePeriodMinutes,
          allowOvernight: response.allowOvernight
        };
        return mappedSettings;
      }),
      tap(response => {
        console.log('✅ Configuración guardada exitosamente:', response);

        // Actualizar localStorage con la nueva configuración
        const authDataStr = localStorage.getItem('authUser');
        if (authDataStr) {
          try {
            const authData = JSON.parse(authDataStr);
            // Actualizar los valores en authUser
            authData.maxCapacity = response.maxCapacity;
            authData.motorcycleRate = response.motorcycleRate;
            authData.carTruckRate = response.carTruckRate;
            authData.nightRate = response.nightRate;
            authData.openingTime = response.openingTime;
            authData.closingTime = response.closingTime;
            authData.currency = response.currency;
            localStorage.setItem('authUser', JSON.stringify(authData));
            console.log('✅ localStorage actualizado con nueva configuración');
          } catch (error) {
            console.error('Error al actualizar localStorage:', error);
          }
        }
      }),
      catchError(error => {
        console.error('❌ Error al guardar configuración:', error);
        throw error;
      })
    );
  }
}

