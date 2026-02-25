import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedResponse } from '../../condos/models/condominium.model';
import {
  ImportantContact,
  CreateImportantContactRequest,
  UpdateImportantContactRequest,
} from '../models/important-contact.model';

@Injectable({ providedIn: 'root' })
export class ImportantContactService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/importantcontacts`;

  readonly loading = signal(false);

  getAll(pageNumber = 1, pageSize = 20): Observable<PaginatedResponse<ImportantContact>> {
    return this.http.get<PaginatedResponse<ImportantContact>>(this.apiUrl, {
      params: { pageNumber, pageSize },
    });
  }

  getById(id: string): Observable<ImportantContact> {
    return this.http.get<ImportantContact>(`${this.apiUrl}/${id}`);
  }

  create(request: CreateImportantContactRequest): Observable<string> {
    return this.http.post(`${this.apiUrl}`, request, { responseType: 'text' });
  }

  update(id: string, request: UpdateImportantContactRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  approve(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/approve`, {});
  }

  reject(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/reject`, {});
  }

  getPending(pageNumber = 1, pageSize = 20): Observable<PaginatedResponse<ImportantContact>> {
    return this.http.get<PaginatedResponse<ImportantContact>>(`${this.apiUrl}/pending`, {
      params: { pageNumber, pageSize },
    });
  }

  getContactTypeNames(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/contact-types`);
  }
}
