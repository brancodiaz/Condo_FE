import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/services/auth.service';

@Component({
  selector: 'app-verify-email',
  imports: [RouterLink],
  templateUrl: './verify-email.page.html',
})
export class VerifyEmailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);

  readonly status = signal<'verifying' | 'success' | 'error'>('verifying');
  readonly errorMessage = signal('');
  readonly email = signal('');
  readonly resendLoading = signal(false);
  readonly resendSuccess = signal(false);

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const email = params.get('email') || '';
      const token = params.get('token') || '';
      this.email.set(email);

      if (email && token) {
        this.authService.verifyEmail(email, token).subscribe({
          next: () => this.status.set('success'),
          error: (err) => {
            this.status.set('error');
            this.errorMessage.set(
              err.error?.message || 'La verificación de correo falló. El enlace puede haber expirado.',
            );
          },
        });
      } else {
        this.status.set('error');
        this.errorMessage.set('Enlace de verificación inválido.');
      }
    });
  }

  resendVerification(): void {
    const email = this.email();
    if (!email) return;

    this.resendLoading.set(true);
    this.authService.resendVerificationEmail(email).subscribe({
      next: () => {
        this.resendLoading.set(false);
        this.resendSuccess.set(true);
      },
      error: () => {
        this.resendLoading.set(false);
        this.resendSuccess.set(true); // Generic message to prevent enumeration
      },
    });
  }
}
