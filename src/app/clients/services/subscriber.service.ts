import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CreateSubscriberRequest {
  name: string;
  phone: string;
  email: string;
  vehiclePlate: string;
  subscriptionMonths: number;
  amount: number;
  startDate: string;
  paymentDate: string;
}

export interface SubscriberResource {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehiclePlate: string;
  subscriptionMonths: number;
  amount: number;
  startDate: string;
  paymentDate: string;
  status: string;
  businessId: string;
}

export interface UpdateSubscriberRequest {
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  vehicleLicensePlate?: string;
  vehicleType?: string;
}

@Injectable({ providedIn: 'root' })
export class SubscriberService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1/subscribers`;

  /**
   * Listar todos los suscriptores del negocio
   * GET /api/v1/subscribers
   */
  getAll(): Observable<SubscriberResource[]> {
    return this.http.get<SubscriberResource[]>(this.baseUrl);
  }

  /**
   * Obtener suscriptor por ID
   * GET /api/v1/subscribers/{subscriberId}
   */
  getById(id: number | string): Observable<SubscriberResource> {
    return this.http.get<SubscriberResource>(`${this.baseUrl}/${id}`);
  }

  /**
   * Crear nuevo suscriptor
   * POST /api/v1/subscribers
   */
  create(subscriber: CreateSubscriberRequest): Observable<SubscriberResource> {
    console.log('📝 Creando suscriptor:', subscriber);
    return this.http.post<SubscriberResource>(this.baseUrl, subscriber);
  }

  /**
   * Actualizar suscriptor existente
   * PUT /api/v1/subscribers/{subscriberId}
   */
  update(id: number | string, subscriber: UpdateSubscriberRequest): Observable<SubscriberResource> {
    console.log('✏️ Actualizando suscriptor:', id, subscriber);
    return this.http.put<SubscriberResource>(`${this.baseUrl}/${id}`, subscriber);
  }

  /**
   * Eliminar suscriptor (solo ADMIN)
   * DELETE /api/v1/subscribers/{subscriberId}
   */
  delete(id: number | string): Observable<void> {
    console.log('🗑️ Eliminando suscriptor:', id);
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

