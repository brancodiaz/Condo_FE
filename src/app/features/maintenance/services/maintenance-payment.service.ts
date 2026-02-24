import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedResponse } from '../../condos/models/condominium.model';
import {
  MaintenancePayment,
  CreateMaintenancePaymentRequest,
  RejectPaymentRequest,
} from '../models/maintenance-payment.model';

@Injectable({ providedIn: 'root' })
export class MaintenancePaymentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/maintenancepayments`;

  readonly loading = signal(false);

  getAll(pageNumber = 1, pageSize = 20): Observable<PaginatedResponse<MaintenancePayment>> {
    return this.http.get<PaginatedResponse<MaintenancePayment>>(this.apiUrl, {
      params: { pageNumber, pageSize },
    });
  }

  getById(id: string): Observable<MaintenancePayment> {
    return this.http.get<MaintenancePayment>(`${this.apiUrl}/${id}`);
  }

  create(request: CreateMaintenancePaymentRequest): Observable<string> {
    return this.http.post(`${this.apiUrl}`, request, { responseType: 'text' });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getPending(): Observable<MaintenancePayment[]> {
    return this.http.get<MaintenancePayment[]>(`${this.apiUrl}/pending`);
  }

  getByUnit(unitId: number): Observable<MaintenancePayment[]> {
    return this.http.get<MaintenancePayment[]>(`${this.apiUrl}/by-unit/${unitId}`);
  }

  approve(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/approve`, {});
  }

  reject(id: string, request: RejectPaymentRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/reject`, request);
  }

  uploadReceipt(id: string, file: File): Observable<void> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<void>(`${this.apiUrl}/${id}/receipt`, formData);
  }
}
