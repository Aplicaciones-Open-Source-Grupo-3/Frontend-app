import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BaseService {
  protected readonly http = inject(HttpClient);
  protected readonly apiUrl = 'http://localhost:3000';

  protected get<T>(endpoint: string) {
    return this.http.get<T>(`${this.apiUrl}/${endpoint}`);
  }
}
