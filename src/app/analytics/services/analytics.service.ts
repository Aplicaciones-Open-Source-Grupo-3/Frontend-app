import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BaseService } from '../../shared/services/base.service';
import { ReportEntity } from '../model/report.entity';

/** Represents the subscription of the user. */
export interface SubscriptionEntity {
  id: number;
  planId: number;
  status: 'active' | 'expired' | string;
  renewsAt: string;
}

/** Represents commercial plan as returned by the backend. */
export interface PlanEntity {
  id: number;
  name: string;
  price?: number;
  benefits?: string[];
}

/** Basic profile of the operator/organization. */
export interface ProfileEntity {
  id: number;
  fullName: string;
  email?: string;
  phone?: string;
  userType?: string;
  companyName?: string;
}


export interface SubscriptionDto {
  id: number;
  planId: number;
  status: 'active'|'expired'|string; renewsAt: string;
}
export interface PlanDto {
  id: number;
  name: string;
}
export interface ProfileDto {
  id: number;
  fullName: string;
}


/**
 * EasyPark Analytics service.
 * This service returns raw backend entities.
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsService extends BaseService {

  /**
   * Fetch analytics KPIs/widgets.
   * @endpoint `GET /reports`
   * @returns Observable of {@link ReportEntity}[]
   */
  getReports(): Observable<ReportEntity[]> {
    return this.get<ReportEntity[]>('reports');
  }


  /**
   * Fetch subscriptions used to populate the history table.
   * @endpoint `GET /subscriptions`
   * @returns Observable of {@link SubscriptionEntity}[]
   */
  getSubscriptions(): Observable<SubscriptionEntity[]> {
    return this.get<SubscriptionEntity[]>('subscriptions');
  }

  /**
   * Fetch available commercial plans.
   * @endpoint `GET /plans`
   * @returns Observable of {@link PlanEntity}[]
   */
  getPlans(): Observable<PlanEntity[]> {
    return this.get<PlanEntity[]>('plans');
  }

  /**
   * Fetch the operator/organization profile.
   * In the mock, profile id `1` is used.
   * @endpoint `GET /profiles/1`
   * @returns Observable of {@link ProfileEntity}
   */
  getProfile(): Observable<ProfileEntity> {
    return this.get<ProfileDto>('profiles/1');
  }
}
