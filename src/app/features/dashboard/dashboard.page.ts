import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth/services/auth.service';
import { TopBarComponent } from '../../shared/components/top-bar/top-bar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TopBarComponent],
  template: `
    <app-top-bar />
    <div class="min-h-screen bg-base-200">
      <div class="p-8">
        <div class="flex items-center gap-4 mb-6">
          <button class="btn btn-ghost btn-sm" (click)="goToCondos()">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Volver a condominios
          </button>
        </div>
        <h1 class="text-3xl font-bold">Panel Principal</h1>
        <p class="mt-2 text-base-content/60">Bienvenido, {{ authService.currentUser()?.firstName }}!</p>
      </div>
    </div>
  `,
})
export class DashboardPage implements OnInit {
  readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  condoId: string | null = null;

  ngOnInit(): void {
    this.condoId = this.route.snapshot.paramMap.get('condoId');
  }

  goToCondos(): void {
    this.router.navigate(['/condos']);
  }
}
