import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';
import { condoContextResolver } from './core/guards/condo-context.resolver';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'condos',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/layout/authenticated-layout.component').then(
        (m) => m.AuthenticatedLayoutComponent,
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/condos/condo-shell/condo-shell.component').then(
            (m) => m.CondoShellComponent,
          ),
      },
      {
        path: ':condoId',
        resolve: { condoContext: condoContextResolver },
        children: [
          {
            path: 'dashboard',
            loadComponent: () =>
              import('./features/dashboard/dashboard.page').then(
                (m) => m.DashboardPage,
              ),
          },
          {
            path: 'blocks',
            loadChildren: () =>
              import('./features/blocks/blocks.routes').then(
                (m) => m.BLOCKS_ROUTES,
              ),
          },
          {
            path: 'units',
            loadChildren: () =>
              import('./features/units/units.routes').then(
                (m) => m.UNITS_ROUTES,
              ),
          },
          {
            path: 'maintenance',
            loadChildren: () =>
              import('./features/maintenance/maintenance.routes').then(
                (m) => m.MAINTENANCE_ROUTES,
              ),
          },
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
        ],
      },
    ],
  },
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/login' },
];
