import { Component, computed, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth/services/auth.service';
import { CondoContextService } from '../../core/services/condo-context.service';

interface StatCard {
  label: string;
  value: string;
  icon: string;
  bgClass: string;
  subtitle: string;
}

interface QuickAction {
  label: string;
  route: string;
  disabled: boolean;
  icon: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="p-6">
      <!-- Header with role badge -->
      <div class="mb-6">
        <div class="flex items-center gap-3 flex-wrap">
          <h1 class="text-2xl font-bold text-base-content">Panel principal</h1>
          @if (condoContext.currentRoleName()) {
            <span class="badge badge-primary">{{ condoContext.currentRoleName() }}</span>
          }
        </div>
        <p class="text-base-content/50 mt-1">{{ greeting() }}</p>
      </div>

      <!-- Admin/Board banner -->
      @if (condoContext.isAdmin()) {
        <div class="alert bg-primary/5 border-primary/20 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <div>
            <p class="text-sm font-medium text-base-content">Modo administrador</p>
            <p class="text-xs text-base-content/50">Tienes acceso completo a la gestion del condominio.</p>
          </div>
        </div>
      }

      <!-- Stat cards - different per role -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        @for (stat of visibleStats(); track stat.label) {
          <div class="card bg-base-100 border border-base-300 shadow-sm">
            <div class="card-body p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-xs text-base-content/50 uppercase tracking-wider">{{ stat.label }}</p>
                  <p class="text-2xl font-bold text-base-content mt-1">{{ stat.value }}</p>
                </div>
                <div class="w-10 h-10 rounded-lg flex items-center justify-center"
                     [class]="stat.bgClass">
                  <span class="inline-flex" [innerHTML]="stat.icon"></span>
                </div>
              </div>
              <p class="text-xs mt-2 text-base-content/40">{{ stat.subtitle }}</p>
            </div>
          </div>
        }
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Quick access -->
        <div class="lg:col-span-2">
          <div class="card bg-base-100 border border-base-300 shadow-sm">
            <div class="card-body p-5">
              <h2 class="text-base font-semibold text-base-content mb-4">Acceso rapido</h2>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                @for (action of visibleActions(); track action.label) {
                  <button
                    class="btn btn-ghost border border-base-300 h-auto py-4 flex-col gap-2 hover:border-primary/30 hover:bg-primary/5"
                    [disabled]="action.disabled"
                    (click)="navigate(action.route)"
                  >
                    <span class="inline-flex" [innerHTML]="action.icon"></span>
                    <span class="text-xs font-medium">{{ action.label }}</span>
                    @if (action.disabled) {
                      <span class="badge badge-xs badge-ghost">Pronto</span>
                    }
                  </button>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- Right column -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Condo info card -->
          <div class="card bg-base-100 border border-base-300 shadow-sm">
            <div class="card-body p-5">
              <h2 class="text-base font-semibold text-base-content mb-3">Info del condominio</h2>
              <div class="space-y-3">
                <div class="flex justify-between text-sm">
                  <span class="text-base-content/50">Nombre</span>
                  <span class="text-base-content font-medium">{{ condoContext.currentCondo()?.name }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-base-content/50">Direccion</span>
                  <span class="text-base-content font-medium truncate ml-4">{{ condoContext.currentCondo()?.address }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-base-content/50">Unidades</span>
                  <span class="text-base-content font-medium">{{ condoContext.currentCondo()?.totalUnits ?? '--' }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-base-content/50">Tu rol</span>
                  <span class="badge badge-primary badge-sm">{{ condoContext.currentRoleName() }}</span>
                </div>
                @if (condoContext.isAdmin() && condoContext.currentCondo()?.subscriptionExpiresAt) {
                  <div class="flex justify-between text-sm">
                    <span class="text-base-content/50">Suscripcion</span>
                    <span class="text-base-content font-medium">{{ condoContext.currentCondo()?.subscriptionExpiresAt | date }}</span>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Recent activity -->
          <div class="card bg-base-100 border border-base-300 shadow-sm">
            <div class="card-body p-5">
              <h2 class="text-base font-semibold text-base-content mb-4">Actividad reciente</h2>
              <p class="text-sm text-base-content/30 text-center py-4">Sin actividad reciente</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DashboardPage implements OnInit {
  readonly authService = inject(AuthService);
  readonly condoContext = inject(CondoContextService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  condoId: string | null = null;

  readonly greeting = computed(() => {
    const name = this.authService.currentUser()?.firstName ?? '';
    const role = this.condoContext.currentRole();

    if (this.condoContext.isAdmin()) {
      return `Bienvenido, ${name}. Tienes acceso completo a la gestion del condominio.`;
    }
    if (role === 'OWNER') {
      return `Bienvenido, ${name}. Aqui puedes ver el estado de tus unidades y pagos.`;
    }
    if (role === 'TENANT') {
      return `Bienvenido, ${name}. Aqui puedes ver informacion de tu unidad.`;
    }
    return `Bienvenido, ${name}. Aqui tienes un resumen de tu condominio.`;
  });

  // --- Stats by role ---
  private readonly adminStats: StatCard[] = [
    {
      label: 'Unidades',
      value: '--',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1" /></svg>',
      bgClass: 'bg-primary/10',
      subtitle: 'Total registradas',
    },
    {
      label: 'Bloques',
      value: '--',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>',
      bgClass: 'bg-info/10',
      subtitle: 'Edificios activos',
    },
    {
      label: 'Pagos pendientes',
      value: '--',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
      bgClass: 'bg-warning/10',
      subtitle: 'Este mes',
    },
    {
      label: 'Incidentes abiertos',
      value: '--',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>',
      bgClass: 'bg-error/10',
      subtitle: 'Requieren atencion',
    },
  ];

  private readonly ownerStats: StatCard[] = [
    {
      label: 'Mis unidades',
      value: '--',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1" /></svg>',
      bgClass: 'bg-primary/10',
      subtitle: 'Unidades a tu nombre',
    },
    {
      label: 'Pagos pendientes',
      value: '--',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
      bgClass: 'bg-warning/10',
      subtitle: 'Por pagar',
    },
    {
      label: 'Reservas',
      value: '--',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>',
      bgClass: 'bg-success/10',
      subtitle: 'Esta semana',
    },
    {
      label: 'Anuncios',
      value: '--',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>',
      bgClass: 'bg-info/10',
      subtitle: 'Nuevos',
    },
  ];

  private readonly tenantStats: StatCard[] = [
    {
      label: 'Mi unidad',
      value: '--',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1" /></svg>',
      bgClass: 'bg-primary/10',
      subtitle: 'Asignada',
    },
    {
      label: 'Pagos pendientes',
      value: '--',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
      bgClass: 'bg-warning/10',
      subtitle: 'Por pagar',
    },
    {
      label: 'Anuncios',
      value: '--',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>',
      bgClass: 'bg-info/10',
      subtitle: 'Nuevos',
    },
  ];

  readonly visibleStats = computed<StatCard[]>(() => {
    const role = this.condoContext.currentRole();
    if (this.condoContext.isAdmin()) return this.adminStats;
    if (role === 'OWNER') return this.ownerStats;
    if (role === 'TENANT' || role === 'RELATIVE') return this.tenantStats;
    return this.tenantStats; // default for other roles
  });

  // --- Quick actions by role ---
  private readonly adminActions: QuickAction[] = [
    {
      label: 'Bloques',
      route: 'blocks',
      disabled: false,
      icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-base-content/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>',
    },
    {
      label: 'Unidades',
      route: 'units',
      disabled: false,
      icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-base-content/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1" /></svg>',
    },
    {
      label: 'Mantenimiento',
      route: 'maintenance',
      disabled: true,
      icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-base-content/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
    },
    {
      label: 'Areas comunes',
      route: 'common-areas',
      disabled: true,
      icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-base-content/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>',
    },
    {
      label: 'Anuncios',
      route: 'announcements',
      disabled: true,
      icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-base-content/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>',
    },
    {
      label: 'Incidentes',
      route: 'incidents',
      disabled: true,
      icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-base-content/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>',
    },
  ];

  private readonly residentActions: QuickAction[] = [
    {
      label: 'Mantenimiento',
      route: 'maintenance',
      disabled: true,
      icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-base-content/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
    },
    {
      label: 'Areas comunes',
      route: 'common-areas',
      disabled: true,
      icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-base-content/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>',
    },
    {
      label: 'Anuncios',
      route: 'announcements',
      disabled: true,
      icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-base-content/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>',
    },
    {
      label: 'Incidentes',
      route: 'incidents',
      disabled: true,
      icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-base-content/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>',
    },
    {
      label: 'Contactos',
      route: 'contacts',
      disabled: true,
      icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-base-content/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>',
    },
  ];

  readonly visibleActions = computed<QuickAction[]>(() => {
    if (this.condoContext.isAdmin()) return this.adminActions;
    return this.residentActions;
  });

  ngOnInit(): void {
    this.condoId = this.route.snapshot.paramMap.get('condoId');
  }

  navigate(route: string): void {
    if (this.condoId) {
      this.router.navigate(['/condos', this.condoId, route]);
    }
  }
}
