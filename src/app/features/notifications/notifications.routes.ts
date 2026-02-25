import { Routes } from '@angular/router';

export const NOTIFICATIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/notification-center/notification-center.page').then(
        (m) => m.NotificationCenterPage,
      ),
  },
];
