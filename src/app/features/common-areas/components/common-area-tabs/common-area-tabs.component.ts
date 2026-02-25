import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CondoContextService } from '../../../../core/services/condo-context.service';

@Component({
  selector: 'app-common-area-tabs',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <div role="tablist" class="tabs tabs-bordered mb-6">
      <a
        role="tab"
        class="tab"
        [routerLink]="getRoute('areas')"
        routerLinkActive="tab-active"
      >
        Areas
      </a>
      <a
        role="tab"
        class="tab"
        [routerLink]="getRoute('reservations')"
        routerLinkActive="tab-active"
      >
        Reservas
      </a>
    </div>
  `,
})
export class CommonAreaTabsComponent {
  private readonly condoContext = inject(CondoContextService);

  getRoute(segment: string): string {
    const condoId = this.condoContext.currentCondoId();
    return `/condos/${condoId}/common-areas/${segment}`;
  }
}
