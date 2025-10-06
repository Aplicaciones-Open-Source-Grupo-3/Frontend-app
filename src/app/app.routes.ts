import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'monitoring/dashboard',
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
    children: [
      {
        path: 'overview',
        loadComponent: () => import('./profiles/pages/profile-overview/profile-overview.page').then((m) => m.ProfileOverviewPageComponent)
      }
    ]
  },
  {
    path: 'monitoring',
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./monitoring/pages/dashboard/dashboard.page').then((m) => m.MonitoringDashboardPageComponent)
      },
      {
        path: 'incidents',
        loadComponent: () => import('./monitoring/pages/incidents/incidents.page').then((m) => m.MonitoringIncidentsPageComponent)
      }
    ]
  },
  {
    path: 'subscription',
    children: [
      {
        path: 'overview',
        loadComponent: () =>
          import('./subscription/pages/subscriptions-overview/subscriptions-overview.page').then((m) => m.SubscriptionsOverviewPageComponent)
      }
    ]
  },
  {
    path: 'clients',
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'operators'
      },
      {
        path: 'operators',
        loadComponent: () =>
          import('./clients/pages/operators/operators.page').then((m) => m.ClientsOperatorsPageComponent)
      }
    ]
  },
  {
    path: 'analytics',
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
    redirectTo: 'monitoring/dashboard'
  }
];

