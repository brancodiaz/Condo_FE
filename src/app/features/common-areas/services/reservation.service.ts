import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedResponse } from '../../condos/models/condominium.model';
import {
  Reservation,
  CreateReservationRequest,
  RejectReservationRequest,
  AvailabilityResponse,
} from '../models/reservation.model';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/reservations`;

  readonly loading = signal(false);

  getAll(pageNumber = 1, pageSize = 20): Observable<PaginatedResponse<Reservation>> {
    return this.http.get<PaginatedResponse<Reservation>>(this.apiUrl, {
      params: { pageNumber, pageSize },
    });
  }

  getById(id: string): Observable<Reservation> {
    return this.http.get<Reservation>(`${this.apiUrl}/${id}`);
  }

  create(request: CreateReservationRequest): Observable<string> {
    return this.http.post(`${this.apiUrl}`, request, { responseType: 'text' });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  approve(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/approve`, {});
  }

  reject(id: string, request: RejectReservationRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/reject`, request);
  }

  cancel(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/cancel`, {});
  }

  getPending(pageNumber = 1, pageSize = 20): Observable<PaginatedResponse<Reservation>> {
    return this.http.get<PaginatedResponse<Reservation>>(`${this.apiUrl}/pending`, {
      params: { pageNumber, pageSize },
    });
  }

  checkAvailability(commonAreaId: string, date: string): Observable<AvailabilityResponse> {
    return this.http.get<AvailabilityResponse>(`${this.apiUrl}/availability`, {
      params: { commonAreaId, date },
    });
  }
}
