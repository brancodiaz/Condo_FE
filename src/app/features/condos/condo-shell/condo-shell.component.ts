import { Component, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/services/auth.service';
import { CondominiumService } from '../services/condominium.service';
import { CondoCardComponent } from '../components/condo-card/condo-card.component';
import { CondoActionsComponent } from '../components/condo-actions/condo-actions.component';
import { TopBarComponent } from '../../../shared/components/top-bar/top-bar.component';
import { Condominium } from '../models/condominium.model';

@Component({
  selector: 'app-condo-shell',
  standalone: true,
  imports: [CondoCardComponent, CondoActionsComponent, TopBarComponent],
  template: `
    <app-top-bar />
    <div class="min-h-screen bg-base-200 p-6 md:p-10">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold text-base-content">
          Bienvenido a Tu Condominio App, {{ userName() }}
        </h1>
        <p class="text-base-content/60 mt-2">Selecciona uno de tus condominios</p>

        <section class="mt-8">
          <h2 class="text-xl font-bold text-base-content mb-4">Tus condominios</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            @for (condo of condominiums(); track condo.id) {
              <app-condo-card
                [condo]="condo"
                (select)="onSelectCondo($event)"
              />
            }
          </div>

          @if (condominiums().length === 0) {
            <p class="text-base-content/40 text-center py-10">
              No tienes condominios asignados aun.
            </p>
          }
        </section>

        <app-condo-actions
          (create)="onCreateCondo()"
          (join)="onJoinCondo()"
        />
      </div>
    </div>
  `,
})
export class CondoShellComponent {
  private readonly authService = inject(AuthService);
  private readonly condoService = inject(CondominiumService);
  private readonly router = inject(Router);
  private autoRedirected = false;

  readonly userName = () => this.authService.currentUser()?.firstName ?? '';
  readonly condominiums = this.condoService.condominiums;

  constructor() {
    effect(() => {
      const condos = this.condominiums();
      if (condos.length === 1 && !this.autoRedirected) {
        this.autoRedirected = true;
        this.router.navigate(['/condos', condos[0].id, 'dashboard']);
      }
    });
  }

  onSelectCondo(condo: Condominium): void {
    this.router.navigate(['/condos', condo.id, 'dashboard']);
  }

  onCreateCondo(): void {
    // TODO: navigate to create condominium page
  }

  onJoinCondo(): void {
    // TODO: navigate to join condominium page
  }
}
