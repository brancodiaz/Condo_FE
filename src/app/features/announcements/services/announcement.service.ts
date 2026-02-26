import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedResponse } from '../../condos/models/condominium.model';
import {
  Announcement,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
} from '../models/announcement.model';

@Injectable({ providedIn: 'root' })
export class AnnouncementService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/announcements`;

  readonly loading = signal(false);

  getAll(pageNumber = 1, pageSize = 20): Observable<PaginatedResponse<Announcement>> {
    return this.http.get<PaginatedResponse<Announcement>>(this.apiUrl, {
      params: { pageNumber, pageSize },
    });
  }

  getById(id: string): Observable<Announcement> {
    return this.http.get<Announcement>(`${this.apiUrl}/${id}`);
  }

  create(request: CreateAnnouncementRequest): Observable<string> {
    return this.http.post(`${this.apiUrl}`, request, { responseType: 'text' });
  }

  update(id: string, request: UpdateAnnouncementRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
