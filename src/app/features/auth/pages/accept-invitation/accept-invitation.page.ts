import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MemberService } from '../../../members/services/member.service';
import { ValidateInvitationResponse } from '../../../members/models/member.model';
import {
  passwordMatchValidator,
  strongPasswordValidator,
} from '../../../../shared/validators/password.validators';

@Component({
  selector: 'app-accept-invitation',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './accept-invitation.page.html',
})
export class AcceptInvitationPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly memberService = inject(MemberService);

  readonly validating = signal(true);
  readonly invitation = signal<ValidateInvitationResponse | null>(null);
  readonly validationError = signal('');
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly success = signal(false);
  private token = '';

  readonly form = this.fb.nonNullable.group(
    {
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(70)]],
      password: ['', [Validators.required, strongPasswordValidator()]],
      passwordConfirmation: ['', [Validators.required]],
    },
    { validators: [passwordMatchValidator('password', 'passwordConfirmation')] },
  );

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
    if (s <= 1) return 'Debil';
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

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.token) {
      this.validating.set(false);
      this.validationError.set('No se encontro un token de invitacion valido.');
      return;
    }

    this.memberService.validateToken(this.token).subscribe({
      next: (res) => {
        this.validating.set(false);
        this.invitation.set(res);
        if (res.isExistingUser) {
          this.success.set(true);
        }
      },
      error: (err) => {
        this.validating.set(false);
        this.validationError.set(
          err.error?.message ?? 'La invitacion no es valida o ha expirado.',
        );
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const inv = this.invitation();
    if (!inv) return;

    this.loading.set(true);
    this.errorMessage.set('');

    const { firstName, lastName, password, passwordConfirmation } = this.form.getRawValue();

    this.memberService
      .acceptInvitation({
        firstName,
        lastName,
        email: inv.email,
        password,
        passwordConfirmation,
        token: this.token,
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.success.set(true);
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMessage.set(
            err.error?.message ?? 'Error al aceptar la invitacion. Intentalo de nuevo.',
          );
        },
      });
  }
}
