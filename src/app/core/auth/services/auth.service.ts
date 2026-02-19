import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, firstValueFrom, from, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenService } from './token.service';
import {
  CreateBasicUserRequest,
  GoogleLoginRequest,
  LoginRequest,
  LoginResponse,
  ResetPasswordRequest,
  UserSummaryResponse,
} from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly tokenService = inject(TokenService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private refreshTimerId: ReturnType<typeof setTimeout> | null = null;

  /** Promise compartida para el refresh en curso (single-flight) */
  private refreshInFlight: Promise<LoginResponse> | null = null;

  readonly currentUser = signal<UserSummaryResponse | null>(null);
  readonly isAuthenticated = computed(() => !!this.currentUser());

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, request).pipe(
      tap((response) => {
        this.tokenService.setRememberMe(request.rememberMe);
        this.handleAuthResponse(response);
      }),
    );
  }

  register(request: CreateBasicUserRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/register`, request);
  }

  googleLogin(googleToken: string): Observable<LoginResponse> {
    const request: GoogleLoginRequest = { googleToken };
    return this.http.post<LoginResponse>(`${this.apiUrl}/google-login`, request).pipe(
      tap((response) => this.handleAuthResponse(response)),
    );
  }

  logout(): void {
    const hadToken = !!this.tokenService.getAccessToken();
    if (hadToken) {
      this.http.post(`${this.apiUrl}/logout`, {}).subscribe();
    }
    this.clearSession();
    this.router.navigate(['/auth/login']);
  }

  forgotPassword(email: string): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/forgot-password/${encodeURIComponent(email)}`,
      {},
    );
  }

  resetPassword(request: ResetPasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/reset-password`, request);
  }

  verifyEmail(email: string, token: string): Observable<void> {
    return this.http.get<void>(`${this.apiUrl}/verify-email`, {
      params: { email, token },
    });
  }

  resendVerificationEmail(email: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/resend-verification-email`, null, {
      params: { email },
    });
  }

  tryRestoreSession(): Observable<boolean> {
    if (!this.isBrowser) {
      return of(false);
    }

    // Si ya hay sesión activa, no hacer nada
    if (this.isAuthenticated()) {
      return of(true);
    }

    if (!this.tokenService.hasRefreshToken()) {
      return of(false);
    }

    return this.executeRefresh().pipe(
      switchMap(() => of(true)),
      catchError(() => {
        this.clearSession();
        return of(false);
      }),
    );
  }

  /**
   * Ejecuta el refresh del token con patrón single-flight basado en Promise.
   * Si ya hay un refresh en curso, todos los llamadores comparten la misma Promise,
   * garantizando UNA SOLA llamada HTTP al backend.
   */
  executeRefresh(): Observable<LoginResponse> {
    // Si ya hay un refresh en vuelo, reutilizar la misma Promise
    if (this.refreshInFlight) {
      return from(this.refreshInFlight);
    }

    const refreshToken = this.tokenService.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token'));
    }

    this.refreshInFlight = firstValueFrom(
      this.http
        .post<LoginResponse>(`${this.apiUrl}/refresh-token`, {
          token: refreshToken,
          rememberMe: this.tokenService.getRememberMe(),
        })
        .pipe(
          tap((response) => this.handleAuthResponse(response)),
          catchError((err) => {
            this.clearSession();
            return throwError(() => err);
          }),
        ),
    ).finally(() => {
      this.refreshInFlight = null;
    });

    return from(this.refreshInFlight);
  }

  private handleAuthResponse(response: LoginResponse): void {
    this.tokenService.setAccessToken(response.accessToken, response.expiresIn);
    this.tokenService.setRefreshToken(response.refreshToken);
    this.currentUser.set(response.user);
    this.scheduleTokenRefresh(response.expiresIn);
  }

  private scheduleTokenRefresh(expiresInSeconds: number): void {
    this.cancelScheduledRefresh();
    // Refresh 60 segundos antes de expirar, mínimo 10 segundos
    const refreshInMs = Math.max((expiresInSeconds - 60) * 1000, 10_000);
    this.refreshTimerId = setTimeout(() => {
      // Si el token aún tiene más de 2 minutos de vida, otro flujo ya lo renovó
      const msUntilExpiry = this.tokenService.getTimeUntilExpiry();
      if (msUntilExpiry > 120_000) {
        this.scheduleTokenRefresh(msUntilExpiry / 1000);
        return;
      }
      this.executeRefresh().subscribe();
    }, refreshInMs);
  }

  private cancelScheduledRefresh(): void {
    if (this.refreshTimerId !== null) {
      clearTimeout(this.refreshTimerId);
      this.refreshTimerId = null;
    }
  }

  private clearSession(): void {
    this.cancelScheduledRefresh();
    this.tokenService.clearAll();
    this.currentUser.set(null);
  }
}
