import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class IncidentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/v1/parking/incidents`;

  // Listar todos los incidentes
  getIncidents(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  // Listar incidentes pendientes
  getPendingIncidents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/pending`);
  }

  // Crear incidente
  addIncident(incident: {
    vehicleId: number;
    description: string;
    reportedBy: string;
  }): Observable<any> {
    return this.http.post<any>(this.baseUrl, incident);
  }

  // Resolver incidente
  resolveIncident(id: number, resolution: string): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/${id}`, { resolution });
  }
}

