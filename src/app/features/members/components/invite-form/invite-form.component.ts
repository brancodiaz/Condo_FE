import { Component, ElementRef, inject, output, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MemberService } from '../../services/member.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { ASSIGNABLE_ROLES } from '../../models/member.model';

@Component({
  selector: 'app-invite-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <dialog #dialog class="modal">
      <div class="modal-box w-full max-w-md">
        <h3 class="text-lg font-bold">Invitar miembro</h3>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="mt-4 space-y-4">
          <div class="form-control">
            <label class="label" for="inviteEmail">
              <span class="label-text">Correo electronico</span>
            </label>
            <input
              id="inviteEmail"
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
            <label class="label" for="inviteRole">
              <span class="label-text">Rol</span>
            </label>
            <select
              id="inviteRole"
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

          @if (responseMessage()) {
            <div role="alert" class="alert" [class.alert-success]="!isError()" [class.alert-error]="isError()">
              <span class="text-sm">{{ responseMessage() }}</span>
            </div>
          }

          <div class="modal-action">
            <button type="button" class="btn btn-ghost" (click)="close()">Cancelar</button>
            <button type="submit" class="btn btn-primary" [disabled]="loading()">
              @if (loading()) {
                <span class="loading loading-spinner loading-sm"></span>
              }
              Enviar invitacion
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
export class InviteFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly memberService = inject(MemberService);
  private readonly toast = inject(ToastService);

  readonly saved = output<void>();
  readonly loading = signal(false);
  readonly responseMessage = signal('');
  readonly isError = signal(false);
  readonly roles = ASSIGNABLE_ROLES;

  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    roleId: ['', [Validators.required]],
  });

  open(): void {
    this.form.reset({ email: '', roleId: '' });
    this.responseMessage.set('');
    this.isError.set(false);
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
    this.responseMessage.set('');

    this.memberService.invite(this.form.getRawValue()).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.isError.set(false);
        this.responseMessage.set(res.message);
        this.toast.success(res.message);
        this.saved.emit();
      },
      error: (err) => {
        this.loading.set(false);
        this.isError.set(true);
        this.responseMessage.set(err.error?.message ?? 'Error al enviar la invitacion');
      },
    });
  }
}
