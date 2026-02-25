import { Component, computed, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TopBarComponent } from '../components/top-bar/top-bar.component';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { ToastContainerComponent } from '../components/toast-container/toast-container.component';
import { CondoContextService } from '../../core/services/condo-context.service';

@Component({
  selector: 'app-authenticated-layout',
  standalone: true,
  imports: [RouterOutlet, TopBarComponent, SidebarComponent, ToastContainerComponent, NgClass],
  template: `
    <div class="min-h-screen bg-base-200">
      <app-top-bar
        [showMenuToggle]="showSidebar()"
        [sidebarToggled]="toggleSidebarFn"
      />

      @if (showSidebar()) {
        <app-sidebar
          [condoId]="condoId()"
          [(mobileOpen)]="sidebarOpen"
        />
      }

      <main
        class="transition-all duration-200 pt-14"
        [ngClass]="showSidebar() ? 'lg:ml-64' : ''"
      >
        <router-outlet />
      </main>

      <app-toast-container />
    </div>
  `,
})
export class AuthenticatedLayoutComponent {
  private readonly condoContext = inject(CondoContextService);

  readonly sidebarOpen = signal(false);
  readonly showSidebar = computed(() => !!this.condoContext.currentCondo());
  readonly condoId = computed(() => String(this.condoContext.currentCondoId() ?? ''));

  readonly toggleSidebarFn = () => this.sidebarOpen.update(v => !v);
}
