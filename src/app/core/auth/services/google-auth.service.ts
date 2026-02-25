import { inject, Injectable, NgZone, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

declare const google: {
  accounts: {
    id: {
      initialize(config: {
        client_id: string;
        callback: (response: { credential: string }) => void;
        auto_select?: boolean;
      }): void;
      renderButton(
        element: HTMLElement,
        options: {
          theme?: string;
          size?: string;
          width?: number;
          text?: string;
          shape?: string;
        },
      ): void;
    };
  };
};

@Injectable({ providedIn: 'root' })
export class GoogleAuthService {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private initialized = false;

  initialize(): void {
    if (!this.isBrowser || this.initialized) return;
    if (typeof google === 'undefined') return;

    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response) => this.handleCredentialResponse(response),
    });

    this.initialized = true;
  }

  renderButton(element: HTMLElement): void {
    if (!this.isBrowser) return;

    this.initialize();

    if (typeof google !== 'undefined') {
      google.accounts.id.renderButton(element, {
        theme: 'outline',
        size: 'large',
        width: 320,
        text: 'signin_with',
        shape: 'rectangular',
      });
    }
  }

  private handleCredentialResponse(response: { credential: string }): void {
    this.ngZone.run(() => {
      this.authService.googleLogin(response.credential).subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: () => {},
      });
    });
  }
}
