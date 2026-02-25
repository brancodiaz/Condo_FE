import { Component, inject, input, model } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CondoContextService } from '../../../core/services/condo-context.service';

export interface SidebarItem {
  label: string;
  icon: string;
  route: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <!-- Mobile overlay -->
    @if (mobileOpen()) {
      <div
        class="fixed inset-0 bg-black/50 z-40 lg:hidden"
        (click)="mobileOpen.set(false)"
      ></div>
    }

    <!-- Sidebar -->
    <aside
      class="fixed top-14 left-0 z-40 h-[calc(100vh-3.5rem)] w-64 bg-base-100 border-r border-base-300 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0"
      [class.-translate-x-full]="!mobileOpen()"
      [class.translate-x-0]="mobileOpen()"
    >
      <!-- Condo info header -->
      <div class="p-4 border-b border-base-300">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <span class="text-sm font-bold text-primary">{{ condoInitials() }}</span>
          </div>
          <div class="min-w-0">
            <p class="text-sm font-semibold text-base-content truncate">
              {{ condoContext.currentCondo()?.name ?? 'Condominio' }}
            </p>
            @if (condoContext.currentRoleName()) {
              <p class="text-xs text-base-content/50">{{ condoContext.currentRoleName() }}</p>
            }
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto py-2 px-2">
        <ul class="menu menu-sm gap-0.5">
          @for (item of menuItems; track item.route) {
            <li>
              @if (item.disabled) {
                <span class="text-base-content/30 cursor-not-allowed">
                  <span class="inline-flex" [innerHTML]="item.icon"></span>
                  {{ item.label }}
                  <span class="badge badge-xs badge-ghost ml-auto">Pronto</span>
                </span>
              } @else {
                <a
                  [routerLink]="getRoute(item.route)"
                  routerLinkActive="active"
                  [routerLinkActiveOptions]="{ exact: item.route === 'dashboard' }"
                  (click)="mobileOpen.set(false)"
                >
                  <span class="inline-flex" [innerHTML]="item.icon"></span>
                  {{ item.label }}
                </a>
              }
            </li>
          }
        </ul>
      </nav>

      <!-- Bottom: Change condo -->
      <div class="p-3 border-t border-base-300">
        <a routerLink="/condos" class="btn btn-ghost btn-sm w-full justify-start gap-2 text-base-content/60">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Cambiar condominio
        </a>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  readonly condoContext = inject(CondoContextService);
  readonly condoId = input.required<string>();
  readonly mobileOpen = model(false);

  readonly menuItems: SidebarItem[] = [
    {
      label: 'Dashboard',
      route: 'dashboard',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>',
    },
    {
      label: 'Bloques',
      route: 'blocks',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>',
    },
    {
      label: 'Unidades',
      route: 'units',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1" /></svg>',
    },
    {
      label: 'Mantenimiento',
      route: 'maintenance',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
    },
    {
      label: 'Areas comunes',
      route: 'common-areas',
      disabled: true,
      icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>',
    },
    {
      label: 'Anuncios',
      route: 'announcements',
      disabled: true,
      icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>',
    },
    {
      label: 'Incidentes',
      route: 'incidents',
      disabled: true,
      icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>',
    },
    {
      label: 'Contactos',
      route: 'contacts',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>',
    },
  ];

  condoInitials(): string {
    const name = this.condoContext.currentCondo()?.name ?? '';
    const words = name.split(' ').filter(Boolean);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  }

  getRoute(segment: string): string {
    return `/condos/${this.condoId()}/${segment}`;
  }
}
