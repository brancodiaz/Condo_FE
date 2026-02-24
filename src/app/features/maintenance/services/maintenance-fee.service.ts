import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedResponse } from '../../condos/models/condominium.model';
import {
  MaintenanceFee,
  CreateMaintenanceFeeRequest,
  UpdateMaintenanceFeeRequest,
} from '../models/maintenance-fee.model';

export interface ComboItem {
  id: string;
  value: string;
}

@Injectable({ providedIn: 'root' })
export class MaintenanceFeeService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/maintenancefees`;

  readonly loading = signal(false);

  getAll(pageNumber = 1, pageSize = 20): Observable<PaginatedResponse<MaintenanceFee>> {
    return this.http.get<PaginatedResponse<MaintenanceFee>>(this.apiUrl, {
      params: { pageNumber, pageSize },
    });
  }

  getById(id: string): Observable<MaintenanceFee> {
    return this.http.get<MaintenanceFee>(`${this.apiUrl}/${id}`);
  }

  create(request: CreateMaintenanceFeeRequest): Observable<string> {
    return this.http.post(`${this.apiUrl}`, request, { responseType: 'text' });
  }

  update(id: string, request: UpdateMaintenanceFeeRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getComboList(): Observable<ComboItem[]> {
    return this.http.get<ComboItem[]>(`${this.apiUrl}/combo-list`);
  }
}
