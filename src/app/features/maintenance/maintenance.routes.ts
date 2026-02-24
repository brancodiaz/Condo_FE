import { Routes } from '@angular/router';

export const MAINTENANCE_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'fees',
    pathMatch: 'full',
  },
  {
    path: 'fees',
    loadComponent: () =>
      import('./pages/fee-list/fee-list.page').then((m) => m.FeeListPage),
  },
  {
    path: 'payments',
    loadComponent: () =>
      import('./pages/payment-list/payment-list.page').then(
        (m) => m.PaymentListPage,
      ),
  },
];
