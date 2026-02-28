import { computed, Injectable, signal } from '@angular/core';
import { CondominiumDetailed } from '../../features/condos/models/condominium.model';

@Injectable({ providedIn: 'root' })
export class CondoContextService {
  readonly currentCondo = signal<CondominiumDetailed | null>(null);
  readonly currentCondoId = computed(() => this.currentCondo()?.condominiumId ?? null);
  readonly currentRole = computed(() => this.currentCondo()?.roleId ?? null);
  readonly currentRoleName = computed(() => this.currentCondo()?.roleName ?? null);

  /** True if the condominium uses blocks */
  readonly hasBlocks = computed(() => this.currentCondo()?.includeBlocks ?? false);

  /** True if user has ADMIN or board roles (PRESIDENT, SECRETARY, TREASURER) */
  readonly isAdmin = computed(() => {
    const role = this.currentRole();
    return role === 'ADMIN' || role === 'PRESIDENT' || role === 'SECRETARY' || role === 'TREASURER';
  });

  setCondo(condo: CondominiumDetailed): void {
    this.currentCondo.set(condo);
  }

  clear(): void {
    this.currentCondo.set(null);
  }
}
