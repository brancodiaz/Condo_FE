import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedResponse } from '../../condos/models/condominium.model';
import { ComboItem, CreateUnitTypeRequest, UnitType, UpdateUnitTypeRequest } from '../models/unit.model';

@Injectable({ providedIn: 'root' })
export class UnitTypeService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/unittypes`;

  getAll(pageNumber = 1, pageSize = 50): Observable<PaginatedResponse<UnitType>> {
    return this.http.get<PaginatedResponse<UnitType>>(this.apiUrl, {
      params: { pageNumber, pageSize },
    });
  }

  getComboList(): Observable<ComboItem[]> {
    return this.http.get<ComboItem[]>(`${this.apiUrl}/combo-list`);
  }

  create(request: CreateUnitTypeRequest): Observable<number> {
    return this.http.post<number>(this.apiUrl, request);
  }

  update(id: number, request: UpdateUnitTypeRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
