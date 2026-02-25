import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si ya sabemos que NO está autenticado y no hay refresh token, dejar pasar
  if (!authService.isAuthenticated()) {
    // Intentar restaurar sesión primero (ej. tras recarga con refresh token)
    return authService.tryRestoreSession().pipe(
      map((restored) => restored ? router.createUrlTree(['/condos']) : true),
    );
  }

  // Ya autenticado → redirigir a condos
  return router.createUrlTree(['/condos']);
};
