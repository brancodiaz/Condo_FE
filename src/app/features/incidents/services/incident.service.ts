import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedResponse } from '../../condos/models/condominium.model';
import {
  Incident,
  CreateIncidentRequest,
  UpdateIncidentRequest,
  IncidentInteraction,
} from '../models/incident.model';

@Injectable({ providedIn: 'root' })
export class IncidentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/incidents`;

  readonly loading = signal(false);

  getAll(pageNumber = 1, pageSize = 20): Observable<PaginatedResponse<Incident>> {
    return this.http.get<PaginatedResponse<Incident>>(this.apiUrl, {
      params: { pageNumber, pageSize },
    });
  }

  getById(id: string): Observable<Incident> {
    return this.http.get<Incident>(`${this.apiUrl}/${id}`);
  }

  create(request: CreateIncidentRequest): Observable<string> {
    return this.http.post(`${this.apiUrl}`, request, { responseType: 'text' });
  }

  update(id: string, request: UpdateIncidentRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  changeStatus(id: string, newStatus: string, comment?: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/status`, { newStatus, comment });
  }

  assign(id: string, assignedToId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/assign`, { assignedToId });
  }

  getInteractions(id: string): Observable<IncidentInteraction[]> {
    return this.http.get<IncidentInteraction[]>(`${this.apiUrl}/${id}/interactions`);
  }

  addComment(id: string, comment: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/comments`, { comment });
  }
}
