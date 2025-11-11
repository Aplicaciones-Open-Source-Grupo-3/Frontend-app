import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, map, tap, throwError, of, switchMap, catchError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { UserEntity, BusinessEntity, LoginRequest, RegisterRequest, AuthResponse } from '../model/user.entity';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly baseUrl = `${environment.apiUrl}/iam/authentication`;

  private currentUserSubject = new BehaviorSubject<UserEntity | null>(null);
  private currentBusinessSubject = new BehaviorSubject<BusinessEntity | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();
  public currentBusiness$ = this.currentBusinessSubject.asObservable();

  constructor() {
    this.loadSession();
  }

  private loadSession(): void {
    const userStr = localStorage.getItem('currentUser');
    const businessStr = localStorage.getItem('currentBusiness');

    if (userStr && businessStr) {
      this.currentUserSubject.next(JSON.parse(userStr));
      this.currentBusinessSubject.next(JSON.parse(businessStr));
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/sign-in`, credentials).pipe(
      tap(response => {
        console.log('🔐 Respuesta completa del backend:', response);
        console.log('👤 Rol recibido del backend:', response.role);
        console.log('📝 Tipo del rol:', typeof response.role);

        // Extraer información del usuario y negocio de la respuesta
        const user: UserEntity = {
          id: response.id,
          businessId: response.businessId,
          username: response.username,
          email: response.email,
          role: response.role,
          name: response.name,
          isActive: true
        };

        // Guardar TODOS los datos del negocio que vienen del backend
        const business: BusinessEntity = {
          id: response.businessId,
          businessName: response.businessName || '',
          address: response.address || '',
          phone: response.phone || '',
          email: response.email || '',
          taxId: response.taxId || '',
          maxCapacity: response.maxCapacity || 50,
          motorcycleRate: response.motorcycleRate || 5.0,
          carTruckRate: response.carTruckRate || 10.0,
          nightRate: response.nightRate || 8.0,
          openingTime: response.openingTime || '08:00',
          closingTime: response.closingTime || '22:00',
          currency: response.currency || 'PEN'
        };

        console.log('✅ Datos del negocio guardados:', business);

        // Guardar en localStorage
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('currentBusiness', JSON.stringify(business));
        localStorage.setItem('authToken', response.token);

        // Guardar también authUser para compatibilidad con otros servicios
        localStorage.setItem('authUser', JSON.stringify(response));

        console.log('✅ Usuario guardado:', user);
        console.log('✅ Rol guardado en localStorage:', user.role);

        // Actualizar los subjects
        this.currentUserSubject.next(user);
        this.currentBusinessSubject.next(business);
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => new Error('Credenciales inválidas'));
      })
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/sign-up`, data).pipe(
      tap(response => {
        // Extraer información del usuario y negocio de la respuesta
        const user: UserEntity = {
          id: response.id,
          businessId: response.businessId,
          username: response.username,
          email: response.email,
          role: response.role,
          name: response.name,
          isActive: true
        };

        const business: BusinessEntity = {
          id: response.businessId,
          businessName: response.businessName,
          address: '',
          phone: '',
          email: '',
          taxId: '',
          maxCapacity: 0,
          motorcycleRate: 0,
          carTruckRate: 0,
          nightRate: 0,
          openingTime: '',
          closingTime: '',
          currency: ''
        };

        // Guardar en localStorage
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('currentBusiness', JSON.stringify(business));
        localStorage.setItem('authToken', response.token);

        // Actualizar los subjects
        this.currentUserSubject.next(user);
        this.currentBusinessSubject.next(business);
      }),
      catchError(error => {
        console.error('Registration error:', error);
        return throwError(() => new Error('Error en el registro'));
      })
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentBusiness');
    localStorage.removeItem('authToken');

    this.currentUserSubject.next(null);
    this.currentBusinessSubject.next(null);

    this.router.navigate(['/iam/login']);
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    const role = user?.role;

    console.log('🔍 Verificando si es admin...');
    console.log('👤 Usuario actual:', user);
    console.log('🎭 Rol actual:', role);

    // Normalizar el rol a mayúsculas y verificar
    const normalizedRole = role?.toString().toUpperCase();
    const isAdmin = normalizedRole === 'ROLE_ADMIN' || normalizedRole === 'ADMIN';

    console.log('🎯 Rol normalizado:', normalizedRole);
    console.log('✅ ¿Es admin?:', isAdmin);

    return isAdmin;
  }

  getCurrentUser(): UserEntity | null {
    return this.currentUserSubject.value;
  }

  getCurrentBusiness(): BusinessEntity | null {
    return this.currentBusinessSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  // Métodos para operadores (estos necesitarán endpoints adicionales en el backend)
  createOperator(operatorData: Partial<UserEntity>): Observable<UserEntity> {
    const currentUser = this.getCurrentUser();
    if (!currentUser || !this.isAdmin()) {
      return throwError(() => new Error('Solo los administradores pueden crear operadores'));
    }

    // TODO: Implementar endpoint en el backend para crear operadores
    return throwError(() => new Error('Funcionalidad no implementada aún en el backend'));
  }

  getOperators(): Observable<UserEntity[]> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return of([]);
    }

    // TODO: Implementar endpoint en el backend para obtener operadores
    return of([]);
  }

  updateOperator(id: number, data: Partial<UserEntity>): Observable<UserEntity> {
    // TODO: Implementar endpoint en el backend para actualizar operadores
    return throwError(() => new Error('Funcionalidad no implementada aún en el backend'));
  }

  deleteOperator(id: number): Observable<void> {
    // TODO: Implementar endpoint en el backend para eliminar operadores
    return throwError(() => new Error('Funcionalidad no implementada aún en el backend'));
  }
}
