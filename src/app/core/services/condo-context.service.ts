import { computed, Injectable, signal } from '@angular/core';
import { Condominium } from '../../features/condos/models/condominium.model';

@Injectable({ providedIn: 'root' })
export class CondoContextService {
  readonly currentCondo = signal<Condominium | null>(null);
  readonly currentCondoId = computed(() => this.currentCondo()?.id ?? null);
  readonly currentRole = signal<string | null>(null);

  setCondo(condo: Condominium): void {
    this.currentCondo.set(condo);
  }

  clear(): void {
    this.currentCondo.set(null);
    this.currentRole.set(null);
  }
}
