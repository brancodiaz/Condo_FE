import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CondominiumDetailed, PaginatedResponse } from '../models/condominium.model';

@Injectable({ providedIn: 'root' })
export class CondominiumService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/condominiums`;

  readonly condominiums = signal<CondominiumDetailed[]>([]);
  readonly loading = signal(false);

  loadCondominiums(): void {
    this.loading.set(true);
    this.http
      .get<PaginatedResponse<CondominiumDetailed>>(this.apiUrl, {
        params: { pageNumber: 1, pageSize: 50, view: 'details' },
      })
      .subscribe({
        next: (response) => {
          this.condominiums.set(response.items);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }
}
