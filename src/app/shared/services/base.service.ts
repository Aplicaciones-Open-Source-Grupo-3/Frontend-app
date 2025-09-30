import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BaseService {
  protected readonly http = inject(HttpClient);
  protected readonly apiUrl = environment.apiUrl;

  protected get<T>(endpoint: string) {
    return this.http.get<T>(`${this.apiUrl}/${endpoint}`);
  }
}
