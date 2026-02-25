import { Routes } from '@angular/router';

export const BLOCKS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/block-list/block-list.page').then((m) => m.BlockListPage),
  },
];
