import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Router } from '@angular/router';
import { CondoContextService } from '../services/condo-context.service';
import { CondominiumService } from '../../features/condos/services/condominium.service';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CondominiumDetailed, PaginatedResponse } from '../../features/condos/models/condominium.model';

/**
 * Sets the condo context when navigating into a condominium.
 * Reads condoId from route params and finds the matching condo from the loaded list.
 * If not found (direct URL navigation), fetches from API.
 */
export const condoContextResolver: ResolveFn<boolean> = async (route: ActivatedRouteSnapshot) => {
  const condoContext = inject(CondoContextService);
  const condoService = inject(CondominiumService);
  const router = inject(Router);
  const http = inject(HttpClient);

  const condoId = route.paramMap.get('condoId');

  if (!condoId) {
    router.navigate(['/condos']);
    return false;
  }

  // Check if already loaded in the service
  const condos = condoService.condominiums();
  const condo = condos.find(c => c.condominiumId === condoId);

  if (condo) {
    condoContext.setCondo(condo);
    return true;
  }

  // Not in cache — fetch from API (direct URL navigation scenario)
  try {
    const response = await firstValueFrom(
      http.get<PaginatedResponse<CondominiumDetailed>>(
        `${environment.apiUrl}/condominiums`,
        { params: { pageNumber: 1, pageSize: 50, view: 'details' } }
      )
    );
    condoService.condominiums.set(response.items);
    const found = response.items.find(c => c.condominiumId === condoId);
    if (found) {
      condoContext.setCondo(found);
      return true;
    }
  } catch {
    // API call failed
  }

  router.navigate(['/condos']);
  return false;
};
