import { Routes } from '@angular/router';

export const CONTACTS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: 'list',
    loadComponent: () =>
      import('./pages/contact-list/contact-list.page').then(
        (m) => m.ContactListPage,
      ),
  },
  {
    path: 'pending',
    loadComponent: () =>
      import('./pages/pending-contacts/pending-contacts.page').then(
        (m) => m.PendingContactsPage,
      ),
  },
];
