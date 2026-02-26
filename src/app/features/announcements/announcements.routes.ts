import { Routes } from '@angular/router';

export const ANNOUNCEMENTS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: 'list',
    loadComponent: () =>
      import('./pages/announcement-list/announcement-list.page').then(
        (m) => m.AnnouncementListPage,
      ),
  },
];
