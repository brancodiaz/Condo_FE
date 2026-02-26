import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CondoContextService } from '../../../../core/services/condo-context.service';

@Component({
  selector: 'app-incident-tabs',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <div role="tablist" class="tabs tabs-bordered mb-6">
      <a
        role="tab"
        class="tab"
        [routerLink]="getRoute('list')"
        routerLinkActive="tab-active"
      >
        Incidentes
      </a>
      <a
        role="tab"
        class="tab"
        [routerLink]="getRoute('types')"
        routerLinkActive="tab-active"
      >
        Tipos
      </a>
    </div>
  `,
})
export class IncidentTabsComponent {
  private readonly condoContext = inject(CondoContextService);

  getRoute(segment: string): string {
    const condoId = this.condoContext.currentCondoId();
    return `/condos/${condoId}/incidents/${segment}`;
  }
}
