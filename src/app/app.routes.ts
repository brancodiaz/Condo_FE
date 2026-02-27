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
        path: 'profile',
        loadChildren: () =>
          import('./features/profile/profile.routes').then(
            (m) => m.PROFILE_ROUTES,
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
            path: 'members',
            loadChildren: () =>
              import('./features/members/members.routes').then(
                (m) => m.MEMBERS_ROUTES,
              ),
          },
          {
            path: 'maintenance',
            loadChildren: () =>
              import('./features/maintenance/maintenance.routes').then(
                (m) => m.MAINTENANCE_ROUTES,
              ),
          },
          {
            path: 'contacts',
            loadChildren: () =>
              import('./features/contacts/contacts.routes').then(
                (m) => m.CONTACTS_ROUTES,
              ),
          },
          {
            path: 'announcements',
            loadChildren: () =>
              import('./features/announcements/announcements.routes').then(
                (m) => m.ANNOUNCEMENTS_ROUTES,
              ),
          },
          {
            path: 'common-areas',
            loadChildren: () =>
              import('./features/common-areas/common-areas.routes').then(
                (m) => m.COMMON_AREAS_ROUTES,
              ),
          },
          {
            path: 'incidents',
            loadChildren: () =>
              import('./features/incidents/incidents.routes').then(
                (m) => m.INCIDENTS_ROUTES,
              ),
          },
          {
            path: 'notifications',
            loadChildren: () =>
              import('./features/notifications/notifications.routes').then(
                (m) => m.NOTIFICATIONS_ROUTES,
              ),
          },
          {
            path: 'settings',
            loadComponent: () =>
              import('./features/condos/pages/condo-settings/condo-settings.page').then(
                (m) => m.CondoSettingsPage,
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
