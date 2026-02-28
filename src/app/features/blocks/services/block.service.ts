import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedResponse } from '../../condos/models/condominium.model';
import { Block, CreateBlockRequest, UpdateBlockRequest } from '../models/block.model';
import { ComboItem } from '../../units/models/unit.model';

@Injectable({ providedIn: 'root' })
export class BlockService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/blocks`;

  readonly loading = signal(false);

  getAll(pageNumber = 1, pageSize = 20): Observable<PaginatedResponse<Block>> {
    return this.http.get<PaginatedResponse<Block>>(this.apiUrl, {
      params: { pageNumber, pageSize },
    });
  }

  getById(id: string): Observable<Block> {
    return this.http.get<Block>(`${this.apiUrl}/${id}`);
  }

  create(request: CreateBlockRequest): Observable<string> {
    return this.http.post(`${this.apiUrl}`, request, { responseType: 'text' });
  }

  update(id: string, request: UpdateBlockRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getComboList(): Observable<ComboItem<string>[]> {
    return this.http.get<ComboItem<string>[]>(`${this.apiUrl}/combo-list`);
  }
}
