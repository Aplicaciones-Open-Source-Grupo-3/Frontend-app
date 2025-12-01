import { BaseEntity } from '../../shared/model/base.entity';
import { UserType } from '../../shared/model/enum/user-type.enum';

export interface UserEntity extends BaseEntity {
  id: number;
  businessId: number | string;
  username: string;
  email: string;
  password?: string;
  role: string;
  name: string;
  createdAt?: string;
  isActive?: boolean;
}

export interface BusinessEntity {
  id: number | string;
  businessName: string;
  address: string;
  phone: string;
  email: string;
  taxId: string;
  maxCapacity: number;
  motorcycleRate: number;
  carTruckRate: number;
  nightRate: number;
  openingTime: string;
  closingTime: string;
  currency: string;
  createdAt?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  businessName: string;
  address: string;
  phone: string;
  email: string;
  taxId: string;
  maxCapacity: number;
  motorcycleRate: number;
  carTruckRate: number;
  nightRate: number;
  openingTime: string;
  closingTime: string;
  currency: string;
  adminUsername: string;
  adminPassword: string;
  adminName: string;
  adminEmail: string;
}

// Respuesta del backend de Spring Boot
export interface AuthResponse {
  id: number;
  username: string;
  email: string;
  name: string;
  role: string;
  businessId: number;
  businessName: string;
  token: string;
  // Datos adicionales del negocio
  address?: string;
  phone?: string;
  taxId?: string;
  maxCapacity?: number;
  motorcycleRate?: number;
  carTruckRate?: number;
  nightRate?: number;
  openingTime?: string;
  closingTime?: string;
  currency?: string;
}
