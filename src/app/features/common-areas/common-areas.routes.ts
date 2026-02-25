import { Routes } from '@angular/router';

export const COMMON_AREAS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'areas',
    pathMatch: 'full',
  },
  {
    path: 'areas',
    loadComponent: () =>
      import('./pages/common-area-list/common-area-list.page').then(
        (m) => m.CommonAreaListPage,
      ),
  },
  {
    path: 'reservations',
    loadComponent: () =>
      import('./pages/reservation-list/reservation-list.page').then(
        (m) => m.ReservationListPage,
      ),
  },
];
