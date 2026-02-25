import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedResponse } from '../../condos/models/condominium.model';
import { CreateUnitRequest, Unit, UnitSummary, UpdateUnitRequest } from '../models/unit.model';

@Injectable({ providedIn: 'root' })
export class UnitService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/condominiums/units`;

  getAll(pageNumber = 1, pageSize = 20): Observable<PaginatedResponse<Unit>> {
    return this.http.get<PaginatedResponse<Unit>>(this.apiUrl, {
      params: { pageNumber, pageSize },
    });
  }

  getPagedSummary(pageNumber = 1, pageSize = 20): Observable<PaginatedResponse<UnitSummary>> {
    return this.http.get<PaginatedResponse<UnitSummary>>(`${this.apiUrl}/paged-summary`, {
      params: { pageNumber, pageSize },
    });
  }

  getById(id: number): Observable<Unit> {
    return this.http.get<Unit>(`${this.apiUrl}/${id}`);
  }

  create(request: CreateUnitRequest): Observable<number> {
    return this.http.post<number>(this.apiUrl, request);
  }

  update(id: number, request: UpdateUnitRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
