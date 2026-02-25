import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/services/auth.service';
import {
  passwordMatchValidator,
  strongPasswordValidator,
} from '../../../../shared/validators/password.validators';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.page.html',
})
export class RegisterPage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  readonly form = this.fb.nonNullable.group(
    {
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(70)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, strongPasswordValidator()]],
      passwordConfirmation: ['', [Validators.required]],
    },
    { validators: [passwordMatchValidator('password', 'passwordConfirmation')] },
  );

  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly success = signal(false);

  readonly passwordStrength = computed(() => {
    const val = this.form.controls.password.value;
    if (!val) return 0;
    let score = 0;
    if (val.length >= 8) score++;
    if (/[a-z]/.test(val)) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/\d/.test(val)) score++;
    if (/[^\da-zA-Z]/.test(val)) score++;
    return score;
  });

  readonly strengthLabel = computed(() => {
    const s = this.passwordStrength();
    if (s <= 1) return 'Débil';
    if (s <= 3) return 'Media';
    if (s === 4) return 'Fuerte';
    return 'Muy Fuerte';
  });

  readonly strengthColor = computed(() => {
    const s = this.passwordStrength();
    if (s <= 1) return 'bg-error';
    if (s <= 3) return 'bg-warning';
    return 'bg-success';
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.register(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(
          err.error?.message || 'Error en el registro. Inténtalo de nuevo.',
        );
      },
    });
  }
}
