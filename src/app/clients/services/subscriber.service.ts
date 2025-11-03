import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SubscriberEntity } from '../model/subscriber.entity';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SubscriberService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/subscribers`;

  getAll(): Observable<SubscriberEntity[]> {
    return this.http.get<SubscriberEntity[]>(this.baseUrl);
  }

  getById(id: string): Observable<SubscriberEntity> {
    return this.http.get<SubscriberEntity>(`${this.baseUrl}/${id}`);
  }

  create(subscriber: Omit<SubscriberEntity, 'id'>): Observable<SubscriberEntity> {
    return this.http.post<SubscriberEntity>(this.baseUrl, subscriber);
  }

  update(id: string, subscriber: Partial<SubscriberEntity>): Observable<SubscriberEntity> {
    return this.http.patch<SubscriberEntity>(`${this.baseUrl}/${id}`, subscriber);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

