import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';
import { CondoContextService } from '../../services/condo-context.service';
import { environment } from '../../../environments/environment';

const PUBLIC_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh-token',
  '/auth/google-login',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/auth/resend-verification-email',
];

function isPublicUrl(url: string): boolean {
  return PUBLIC_PATHS.some((path) => url.includes(path));
}

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const tokenService = inject(TokenService);
  const authService = inject(AuthService);
  const condoContext = inject(CondoContextService);

  if (!req.url.startsWith(environment.apiUrl) || isPublicUrl(req.url)) {
    return next(req);
  }

  const accessToken = tokenService.getAccessToken();
  const condoId = condoContext.currentCondoId();

  const headers: Record<string, string> = {};
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  if (condoId) headers['x-empresa-id'] = String(condoId);

  const authReq = Object.keys(headers).length
    ? req.clone({ setHeaders: headers })
    : req;

  return next(authReq).pipe(
    catchError((error) => {
      // Solo intentar refresh si:
      // 1. El error es 401
      // 2. NO teníamos un access token válido (ya había expirado o no existía)
      // 3. Tenemos un refresh token disponible
      //
      // Si enviamos un access token válido y recibimos 401,
      // el problema es de autorización, no de expiración — no hacer refresh.
      if (error.status === 401 && !accessToken && tokenService.hasRefreshToken()) {
        return authService.executeRefresh().pipe(
          switchMap(() => {
            const newToken = tokenService.getAccessToken();
            const retryHeaders: Record<string, string> = { Authorization: `Bearer ${newToken}` };
            if (condoId) retryHeaders['x-empresa-id'] = String(condoId);
            const retryReq = req.clone({ setHeaders: retryHeaders });
            return next(retryReq);
          }),
          catchError((refreshError) => {
            authService.logout();
            return throwError(() => refreshError);
          }),
        );
      }
      return throwError(() => error);
    }),
  );
};
