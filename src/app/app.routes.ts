import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './iam/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'iam/login',
    pathMatch: 'full'
  },
  {
    path: 'iam',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./iam/pages/login/login.page').then((m) => m.IamLoginPageComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./iam/pages/register/register.page').then((m) => m.IamRegisterPageComponent)
      }
    ]
  },
  {
    path: 'profiles',
    canActivate: [authGuard],
    children: [
      {
        path: 'overview',
        loadComponent: () => import('./profiles/pages/profile-overview/profile-overview.page').then((m) => m.ProfileOverviewPageComponent)
      }
    ]
  },
  {
    path: 'monitoring',
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./monitoring/pages/dashboard/dashboard.page').then((m) => m.MonitoringDashboardPageComponent)
      },
      {
        path: 'management',
        loadComponent: () => import('./monitoring/pages/management/management.page').then((m) => m.MonitoringManagementPageComponent)
      }
    ]
  },
  {
    path: 'accounting',
    canActivate: [authGuard],
    children: [
      {
        path: 'overview',
        loadComponent: () =>
          import('./accounting/pages/accounting-overview/accounting-overview.page').then((m) => m.AccountingOverviewPageComponent)
      }
    ]
  },
  {
    path: 'clients',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'operators'
      },
      {
        path: 'operators',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./clients/pages/operators/operators.page').then((m) => m.ClientsOperatorsPageComponent)
      }
    ]
  },
  {
    path: 'analytics',
    canActivate: [authGuard],
    children: [
      {
        path: 'overview',
        loadComponent: () =>
          import('./analytics/pages/analytics-overview/analytics-overview.page').then((m) => m.AnalyticsOverviewPageComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'iam/login'
  }
];
