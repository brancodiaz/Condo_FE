import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ChangePasswordRequest,
  UpdateProfileRequest,
  UserProfileResponse,
} from '../models/profile.model';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/users`;

  getProfile(): Observable<UserProfileResponse> {
    return this.http.get<UserProfileResponse>(`${this.apiUrl}/profile`);
  }

  updateProfile(request: UpdateProfileRequest): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/me`, request);
  }

  changePassword(request: ChangePasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/me/change-password`, request);
  }

  updateTheme(theme: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/me/theme`, { theme });
  }

  deleteAccount(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/me`);
  }
}
