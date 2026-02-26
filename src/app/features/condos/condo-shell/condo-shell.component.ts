import { Component, effect, inject, OnInit, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/services/auth.service';
import { CondoContextService } from '../../../core/services/condo-context.service';
import { CondominiumService } from '../services/condominium.service';
import { CondoCardComponent } from '../components/condo-card/condo-card.component';
import { CondoActionsComponent } from '../components/condo-actions/condo-actions.component';
import { CondoFormComponent } from '../components/condo-form/condo-form.component';
import { CondominiumDetailed } from '../models/condominium.model';

@Component({
  selector: 'app-condo-shell',
  standalone: true,
  imports: [CondoCardComponent, CondoActionsComponent, CondoFormComponent],
  template: `
    <div class="p-6 md:p-10">
      <div class="max-w-3xl mx-auto">
        <!-- Welcome header -->
        <div class="mb-8">
          <h1 class="text-2xl font-bold text-base-content">
            Hola, {{ userName() }}
          </h1>
          <p class="text-base-content/50 mt-1">Selecciona un condominio para continuar</p>
        </div>

        <!-- Condo list -->
        <section>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-sm font-medium text-base-content/60 uppercase tracking-wider">
              Tus condominios
            </h2>
            <span class="badge badge-ghost badge-sm">{{ condominiums().length }}</span>
          </div>

          @if (condominiums().length > 0) {
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              @for (condo of condominiums(); track condo.condominiumId) {
                <app-condo-card
                  [condo]="condo"
                  (select)="onSelectCondo($event)"
                />
              }
            </div>
          } @else {
            <div class="card bg-base-100 border border-base-300">
              <div class="card-body items-center text-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-base-content/20 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p class="text-base-content/40">No tienes condominios asignados aun.</p>
                <p class="text-base-content/30 text-sm">Crea uno nuevo o solicita acceso a uno existente.</p>
              </div>
            </div>
          }
        </section>

        <app-condo-actions
          (create)="onCreateCondo()"
          (join)="onJoinCondo()"
        />

        <app-condo-form (saved)="onCondoSaved()" />
      </div>
    </div>
  `,
})
export class CondoShellComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly condoService = inject(CondominiumService);
  private readonly condoContext = inject(CondoContextService);
  private readonly router = inject(Router);
  private autoRedirected = false;

  private readonly condoForm = viewChild(CondoFormComponent);

  readonly userName = () => this.authService.currentUser()?.firstName ?? '';
  readonly condominiums = this.condoService.condominiums;

  constructor() {
    // Clear condo context when returning to selection
    this.condoContext.clear();

    effect(() => {
      const condos = this.condominiums();
      if (condos.length === 1 && !this.autoRedirected) {
        this.autoRedirected = true;
        this.router.navigate(['/condos', condos[0].condominiumId, 'dashboard']);
      }
    });
  }

  ngOnInit(): void {
    this.condoService.loadCondominiums();
  }

  onSelectCondo(condo: CondominiumDetailed): void {
    this.router.navigate(['/condos', condo.condominiumId, 'dashboard']);
  }

  onCreateCondo(): void {
    this.condoForm()?.openCreate();
  }

  onCondoSaved(): void {
    this.condoService.loadCondominiums();
  }

  onJoinCondo(): void {
    // TODO: navigate to join condominium page
  }
}
