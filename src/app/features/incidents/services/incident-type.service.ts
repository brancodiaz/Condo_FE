import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedResponse } from '../../condos/models/condominium.model';
import {
  IncidentType,
  CreateIncidentTypeRequest,
  UpdateIncidentTypeRequest,
} from '../models/incident-type.model';

interface ComboItem {
  id: number;
  value: string;
}

@Injectable({ providedIn: 'root' })
export class IncidentTypeService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/incidenttypes`;

  readonly loading = signal(false);

  getAll(pageNumber = 1, pageSize = 20): Observable<PaginatedResponse<IncidentType>> {
    return this.http.get<PaginatedResponse<IncidentType>>(this.apiUrl, {
      params: { pageNumber, pageSize },
    });
  }

  getById(id: number): Observable<IncidentType> {
    return this.http.get<IncidentType>(`${this.apiUrl}/${id}`);
  }

  create(request: CreateIncidentTypeRequest): Observable<string> {
    return this.http.post(`${this.apiUrl}`, request, { responseType: 'text' });
  }

  update(id: number, request: UpdateIncidentTypeRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getComboList(): Observable<ComboItem[]> {
    return this.http.get<ComboItem[]>(`${this.apiUrl}/combo-list`);
  }
}
