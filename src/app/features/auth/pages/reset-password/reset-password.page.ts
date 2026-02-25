import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/services/auth.service';
import {
  passwordMatchValidator,
  strongPasswordValidator,
} from '../../../../shared/validators/password.validators';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.page.html',
})
export class ResetPasswordPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);

  private token = '';

  readonly form = this.fb.nonNullable.group(
    {
      password: ['', [Validators.required, strongPasswordValidator()]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: [passwordMatchValidator('password', 'confirmPassword')] },
  );

  readonly loading = signal(false);
  readonly success = signal(false);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.token = params.get('token') || '';
    });
  }

  onSubmit(): void {
    if (this.form.invalid || !this.token) {
      this.form.markAllAsTouched();
      if (!this.token) {
        this.errorMessage.set('Token de restablecimiento inválido o faltante.');
      }
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.authService
      .resetPassword({
        token: this.token,
        password: this.form.controls.password.value,
        confirmPassword: this.form.controls.confirmPassword.value,
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.success.set(true);
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMessage.set(
            err.error?.message || 'Error al restablecer la contraseña. El enlace puede haber expirado.',
          );
        },
      });
  }
}
