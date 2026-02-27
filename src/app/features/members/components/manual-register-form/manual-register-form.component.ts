import { Component, ElementRef, inject, output, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MemberService } from '../../services/member.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { ASSIGNABLE_ROLES } from '../../models/member.model';

@Component({
  selector: 'app-manual-register-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <dialog #dialog class="modal">
      <div class="modal-box w-full max-w-md">
        <h3 class="text-lg font-bold">Registro manual de miembro</h3>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="mt-4 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label" for="manualFirstName">
                <span class="label-text">Nombre</span>
              </label>
              <input
                id="manualFirstName"
                type="text"
                formControlName="firstName"
                class="input input-bordered w-full"
                [class.input-error]="form.controls.firstName.touched && form.controls.firstName.invalid"
                placeholder="Juan"
              />
              @if (form.controls.firstName.touched && form.controls.firstName.hasError('required')) {
                <label class="label">
                  <span class="label-text-alt text-error">Obligatorio</span>
                </label>
              }
            </div>

            <div class="form-control">
              <label class="label" for="manualLastName">
                <span class="label-text">Apellido</span>
              </label>
              <input
                id="manualLastName"
                type="text"
                formControlName="lastName"
                class="input input-bordered w-full"
                [class.input-error]="form.controls.lastName.touched && form.controls.lastName.invalid"
                placeholder="Perez"
              />
              @if (form.controls.lastName.touched && form.controls.lastName.hasError('required')) {
                <label class="label">
                  <span class="label-text-alt text-error">Obligatorio</span>
                </label>
              }
            </div>
          </div>

          <div class="form-control">
            <label class="label" for="manualEmail">
              <span class="label-text">Correo electronico</span>
            </label>
            <input
              id="manualEmail"
              type="email"
              formControlName="email"
              class="input input-bordered w-full"
              [class.input-error]="form.controls.email.touched && form.controls.email.invalid"
              placeholder="correo@ejemplo.com"
            />
            @if (form.controls.email.touched && form.controls.email.hasError('required')) {
              <label class="label">
                <span class="label-text-alt text-error">El correo es obligatorio</span>
              </label>
            } @else if (form.controls.email.touched && form.controls.email.hasError('email')) {
              <label class="label">
                <span class="label-text-alt text-error">Ingresa un correo valido</span>
              </label>
            }
          </div>

          <div class="form-control">
            <label class="label" for="manualRole">
              <span class="label-text">Rol</span>
            </label>
            <select
              id="manualRole"
              formControlName="roleId"
              class="select select-bordered w-full"
              [class.select-error]="form.controls.roleId.touched && form.controls.roleId.invalid"
            >
              <option value="" disabled>Selecciona un rol</option>
              @for (role of roles; track role.id) {
                <option [value]="role.id">{{ role.label }}</option>
              }
            </select>
            @if (form.controls.roleId.touched && form.controls.roleId.hasError('required')) {
              <label class="label">
                <span class="label-text-alt text-error">El rol es obligatorio</span>
              </label>
            }
          </div>

          @if (errorMessage()) {
            <div role="alert" class="alert alert-error">
              <span class="text-sm">{{ errorMessage() }}</span>
            </div>
          }

          <div class="modal-action">
            <button type="button" class="btn btn-ghost" (click)="close()">Cancelar</button>
            <button type="submit" class="btn btn-primary" [disabled]="loading()">
              @if (loading()) {
                <span class="loading loading-spinner loading-sm"></span>
              }
              Registrar miembro
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  `,
})
export class ManualRegisterFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly memberService = inject(MemberService);
  private readonly toast = inject(ToastService);

  readonly saved = output<void>();
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly roles = ASSIGNABLE_ROLES;

  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(50)]],
    lastName: ['', [Validators.required, Validators.maxLength(70)]],
    email: ['', [Validators.required, Validators.email]],
    roleId: ['', [Validators.required]],
  });

  open(): void {
    this.form.reset({ firstName: '', lastName: '', email: '', roleId: '' });
    this.errorMessage.set('');
    this.dialogRef().nativeElement.showModal();
  }

  close(): void {
    this.dialogRef().nativeElement.close();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.memberService.manualRegister(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.success('Miembro registrado exitosamente');
        this.saved.emit();
        this.close();
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message ?? 'Error al registrar el miembro');
      },
    });
  }
}
