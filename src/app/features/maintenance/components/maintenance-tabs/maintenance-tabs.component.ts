import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CondoContextService } from '../../../../core/services/condo-context.service';

@Component({
  selector: 'app-maintenance-tabs',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <div role="tablist" class="tabs tabs-bordered mb-6">
      <a
        role="tab"
        class="tab"
        [routerLink]="getRoute('fees')"
        routerLinkActive="tab-active"
      >
        Cuotas
      </a>
      <a
        role="tab"
        class="tab"
        [routerLink]="getRoute('payments')"
        routerLinkActive="tab-active"
      >
        Pagos
      </a>
    </div>
  `,
})
export class MaintenanceTabsComponent {
  private readonly condoContext = inject(CondoContextService);

  getRoute(segment: string): string {
    const condoId = this.condoContext.currentCondoId();
    return `/condos/${condoId}/maintenance/${segment}`;
  }
}
