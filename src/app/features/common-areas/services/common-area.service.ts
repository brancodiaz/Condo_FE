import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedResponse } from '../../condos/models/condominium.model';
import {
  CommonArea,
  CreateCommonAreaRequest,
  UpdateCommonAreaRequest,
} from '../models/common-area.model';

interface ComboItem {
  id: string;
  value: string;
}

@Injectable({ providedIn: 'root' })
export class CommonAreaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/commonareas`;

  readonly loading = signal(false);

  getAll(pageNumber = 1, pageSize = 20): Observable<PaginatedResponse<CommonArea>> {
    return this.http.get<PaginatedResponse<CommonArea>>(this.apiUrl, {
      params: { pageNumber, pageSize },
    });
  }

  getById(id: string): Observable<CommonArea> {
    return this.http.get<CommonArea>(`${this.apiUrl}/${id}`);
  }

  create(request: CreateCommonAreaRequest): Observable<string> {
    return this.http.post(`${this.apiUrl}`, request, { responseType: 'text' });
  }

  update(id: string, request: UpdateCommonAreaRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getComboList(): Observable<ComboItem[]> {
    return this.http.get<ComboItem[]>(`${this.apiUrl}/combo-list`);
  }
}
