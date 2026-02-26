import { Routes } from '@angular/router';

export const INCIDENTS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: 'list',
    loadComponent: () =>
      import('./pages/incident-list/incident-list.page').then(
        (m) => m.IncidentListPage,
      ),
  },
  {
    path: 'types',
    loadComponent: () =>
      import('./pages/incident-type-list/incident-type-list.page').then(
        (m) => m.IncidentTypeListPage,
      ),
  },
  {
    path: ':incidentId',
    loadComponent: () =>
      import('./pages/incident-detail/incident-detail.page').then(
        (m) => m.IncidentDetailPage,
      ),
  },
];
