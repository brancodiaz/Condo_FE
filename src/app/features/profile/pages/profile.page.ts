import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService } from '../services/profile.service';
import { AuthService } from '../../../core/auth/services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';
import { UserProfileResponse } from '../models/profile.model';
import {
  strongPasswordValidator,
  passwordMatchValidator,
} from '../../../shared/validators/password.validators';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  template: `
    <div class="p-4 md:p-6 max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold text-base-content mb-6">Mi perfil</h1>

      @if (loading()) {
        <div class="flex justify-center py-12">
          <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>
      } @else if (profile()) {
        <!-- Personal info -->
        <div class="card bg-base-100 border border-base-300 mb-6">
          <div class="card-body">
            <h2 class="card-title text-base">Informacion personal</h2>

            <form [formGroup]="profileForm" (ngSubmit)="onSaveProfile()" class="mt-4 space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-control">
                  <label class="label" for="profileFirstName">
                    <span class="label-text">Nombre</span>
                  </label>
                  <input
                    id="profileFirstName"
                    type="text"
                    formControlName="firstName"
                    class="input input-bordered w-full"
                    [class.input-error]="profileForm.controls.firstName.touched && profileForm.controls.firstName.invalid"
                  />
                  @if (profileForm.controls.firstName.touched && profileForm.controls.firstName.hasError('required')) {
                    <label class="label">
                      <span class="label-text-alt text-error">El nombre es obligatorio</span>
                    </label>
                  }
                </div>

                <div class="form-control">
                  <label class="label" for="profileMiddleName">
                    <span class="label-text">Segundo nombre</span>
                  </label>
                  <input
                    id="profileMiddleName"
                    type="text"
                    formControlName="middleName"
                    class="input input-bordered w-full"
                  />
                </div>

                <div class="form-control">
                  <label class="label" for="profileLastName">
                    <span class="label-text">Apellido</span>
                  </label>
                  <input
                    id="profileLastName"
                    type="text"
                    formControlName="lastName"
                    class="input input-bordered w-full"
                    [class.input-error]="profileForm.controls.lastName.touched && profileForm.controls.lastName.invalid"
                  />
                  @if (profileForm.controls.lastName.touched && profileForm.controls.lastName.hasError('required')) {
                    <label class="label">
                      <span class="label-text-alt text-error">El apellido es obligatorio</span>
                    </label>
                  }
                </div>

                <div class="form-control">
                  <label class="label" for="profilePhone">
                    <span class="label-text">Telefono</span>
                  </label>
                  <input
                    id="profilePhone"
                    type="tel"
                    formControlName="phone"
                    class="input input-bordered w-full"
                  />
                </div>

                <div class="form-control">
                  <label class="label" for="profileDob">
                    <span class="label-text">Fecha de nacimiento</span>
                  </label>
                  <input
                    id="profileDob"
                    type="date"
                    formControlName="dateOfBirth"
                    class="input input-bordered w-full"
                  />
                </div>

                <div class="form-control">
                  <label class="label" for="profileDocType">
                    <span class="label-text">Tipo de documento</span>
                  </label>
                  <select
                    id="profileDocType"
                    formControlName="documentType"
                    class="select select-bordered w-full"
                  >
                    <option value="">Seleccionar</option>
                    <option value="CI">Cedula de identidad</option>
                    <option value="PASSPORT">Pasaporte</option>
                    <option value="DNI">DNI</option>
                    <option value="OTHER">Otro</option>
                  </select>
                </div>

                <div class="form-control">
                  <label class="label" for="profileDocId">
                    <span class="label-text">Numero de documento</span>
                  </label>
                  <input
                    id="profileDocId"
                    type="text"
                    formControlName="documentId"
                    class="input input-bordered w-full"
                  />
                </div>
              </div>

              <!-- Readonly fields -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-base-300">
                <div>
                  <p class="text-xs text-base-content/50 mb-1">Correo electronico</p>
                  <p class="text-sm font-medium">{{ profile()!.email }}</p>
                </div>
                <div>
                  <p class="text-xs text-base-content/50 mb-1">Cuenta creada</p>
                  <p class="text-sm font-medium">{{ profile()!.createdAt | date:'mediumDate' }}</p>
                </div>
              </div>

              <div class="flex justify-end pt-2">
                <button type="submit" class="btn btn-primary" [disabled]="savingProfile() || profileForm.pristine">
                  @if (savingProfile()) {
                    <span class="loading loading-spinner loading-sm"></span>
                  }
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Change password -->
        <div class="card bg-base-100 border border-base-300 mb-6">
          <div class="card-body">
            <h2 class="card-title text-base">Seguridad</h2>
            <p class="text-sm text-base-content/60">Cambiar la contrasena de tu cuenta.</p>

            <form [formGroup]="passwordForm" (ngSubmit)="onChangePassword()" class="mt-4 space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-control md:col-span-2">
                  <label class="label" for="currentPassword">
                    <span class="label-text">Contrasena actual</span>
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    formControlName="currentPassword"
                    class="input input-bordered w-full max-w-md"
                    [class.input-error]="passwordForm.controls.currentPassword.touched && passwordForm.controls.currentPassword.invalid"
                  />
                  @if (passwordForm.controls.currentPassword.touched && passwordForm.controls.currentPassword.hasError('required')) {
                    <label class="label">
                      <span class="label-text-alt text-error">La contrasena actual es obligatoria</span>
                    </label>
                  }
                </div>

                <div class="form-control">
                  <label class="label" for="newPassword">
                    <span class="label-text">Nueva contrasena</span>
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    formControlName="newPassword"
                    class="input input-bordered w-full"
                    [class.input-error]="passwordForm.controls.newPassword.touched && passwordForm.controls.newPassword.invalid"
                  />
                  @if (passwordForm.controls.newPassword.touched && passwordForm.controls.newPassword.hasError('required')) {
                    <label class="label">
                      <span class="label-text-alt text-error">La nueva contrasena es obligatoria</span>
                    </label>
                  }
                  @if (passwordForm.controls.newPassword.touched && passwordForm.controls.newPassword.hasError('strongPassword')) {
                    <label class="label">
                      <span class="label-text-alt text-error">Minimo 8 caracteres, mayuscula, minuscula, numero y caracter especial</span>
                    </label>
                  }
                </div>

                <div class="form-control">
                  <label class="label" for="confirmPassword">
                    <span class="label-text">Confirmar contrasena</span>
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    formControlName="confirmPassword"
                    class="input input-bordered w-full"
                    [class.input-error]="passwordForm.controls.confirmPassword.touched && passwordForm.controls.confirmPassword.invalid"
                  />
                  @if (passwordForm.controls.confirmPassword.touched && passwordForm.controls.confirmPassword.hasError('passwordMismatch')) {
                    <label class="label">
                      <span class="label-text-alt text-error">Las contrasenas no coinciden</span>
                    </label>
                  }
                </div>
              </div>

              <div class="flex justify-end pt-2">
                <button type="submit" class="btn btn-primary" [disabled]="savingPassword() || passwordForm.pristine">
                  @if (savingPassword()) {
                    <span class="loading loading-spinner loading-sm"></span>
                  }
                  Cambiar contrasena
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Danger zone -->
        <div class="card bg-base-100 border border-error/30">
          <div class="card-body">
            <h2 class="card-title text-base text-error">Zona peligrosa</h2>
            <p class="text-sm text-base-content/60">
              Eliminar tu cuenta es una accion permanente. Se eliminaran todos tus datos y no podras recuperarlos.
            </p>
            <div class="mt-3">
              @if (!confirmDelete()) {
                <button class="btn btn-error btn-outline btn-sm" (click)="confirmDelete.set(true)">
                  Eliminar mi cuenta
                </button>
              } @else {
                <div class="flex items-center gap-3">
                  <span class="text-sm text-error font-medium">Estas seguro?</span>
                  <button class="btn btn-error btn-sm" (click)="onDeleteAccount()" [disabled]="deleting()">
                    @if (deleting()) {
                      <span class="loading loading-spinner loading-sm"></span>
                    }
                    Si, eliminar
                  </button>
                  <button class="btn btn-ghost btn-sm" (click)="confirmDelete.set(false)">Cancelar</button>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class ProfilePage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly profileService = inject(ProfileService);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly profile = signal<UserProfileResponse | null>(null);
  readonly loading = signal(true);
  readonly savingProfile = signal(false);
  readonly savingPassword = signal(false);
  readonly deleting = signal(false);
  readonly confirmDelete = signal(false);

  readonly profileForm = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    middleName: [''],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    phone: [''],
    dateOfBirth: [''],
    documentType: [''],
    documentId: [''],
  });

  readonly passwordForm = this.fb.nonNullable.group(
    {
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, strongPasswordValidator()]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: [passwordMatchValidator('newPassword', 'confirmPassword')] },
  );

  ngOnInit(): void {
    this.loadProfile();
  }

  private loadProfile(): void {
    this.loading.set(true);
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.profileForm.patchValue({
          firstName: profile.firstName,
          middleName: profile.middleName ?? '',
          lastName: profile.lastName,
          phone: profile.phone ?? '',
          dateOfBirth: profile.dateOfBirth ?? '',
          documentType: profile.documentType ?? '',
          documentId: profile.documentId ?? '',
        });
        this.profileForm.markAsPristine();
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Error al cargar el perfil');
        this.loading.set(false);
      },
    });
  }

  onSaveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.savingProfile.set(true);
    const data = this.profileForm.getRawValue();

    this.profileService
      .updateProfile({
        firstName: data.firstName,
        middleName: data.middleName || null,
        lastName: data.lastName,
        phone: data.phone || null,
        dateOfBirth: data.dateOfBirth || null,
        documentType: data.documentType || null,
        documentId: data.documentId || null,
      })
      .subscribe({
        next: () => {
          this.savingProfile.set(false);
          this.toast.success('Perfil actualizado');
          this.profileForm.markAsPristine();
          this.loadProfile();
        },
        error: (err) => {
          this.savingProfile.set(false);
          this.toast.error(err.error?.message ?? 'Error al guardar el perfil');
        },
      });
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.savingPassword.set(true);
    const data = this.passwordForm.getRawValue();

    this.profileService
      .changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      })
      .subscribe({
        next: () => {
          this.savingPassword.set(false);
          this.toast.success('Contrasena actualizada');
          this.passwordForm.reset();
        },
        error: (err) => {
          this.savingPassword.set(false);
          this.toast.error(err.error?.message ?? 'Error al cambiar la contrasena');
        },
      });
  }

  onDeleteAccount(): void {
    this.deleting.set(true);
    this.profileService.deleteAccount().subscribe({
      next: () => {
        this.deleting.set(false);
        this.toast.success('Cuenta eliminada');
        this.authService.logout();
      },
      error: (err) => {
        this.deleting.set(false);
        this.toast.error(err.error?.message ?? 'Error al eliminar la cuenta');
        this.confirmDelete.set(false);
      },
    });
  }
}
