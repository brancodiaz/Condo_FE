import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si ya hay sesión activa, permitir acceso inmediato
  if (authService.isAuthenticated()) {
    return true;
  }

  // Intentar restaurar sesión con el refresh token (ej. tras recarga de página)
  return authService.tryRestoreSession().pipe(
    map((restored) => restored || router.createUrlTree(['/auth/login'])),
  );
};
