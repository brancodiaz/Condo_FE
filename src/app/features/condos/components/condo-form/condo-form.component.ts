import { Component, ElementRef, inject, output, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CondominiumService } from '../../services/condominium.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { CondominiumResponse } from '../../models/condominium.model';

@Component({
  selector: 'app-condo-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <dialog #dialog class="modal">
      <div class="modal-box w-full max-w-lg">
        <h3 class="text-lg font-bold">{{ isEdit() ? 'Editar condominio' : 'Nuevo condominio' }}</h3>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="mt-4 space-y-4">
          <div class="form-control">
            <label class="label" for="condoName">
              <span class="label-text">Nombre</span>
            </label>
            <input
              id="condoName"
              type="text"
              formControlName="name"
              class="input input-bordered w-full"
              [class.input-error]="form.controls.name.touched && form.controls.name.invalid"
              placeholder="Ej: Residencial Los Pinos"
            />
            @if (form.controls.name.touched && form.controls.name.hasError('required')) {
              <label class="label">
                <span class="label-text-alt text-error">El nombre es obligatorio</span>
              </label>
            }
          </div>

          <div class="form-control">
            <label class="label" for="condoAddress">
              <span class="label-text">Direccion</span>
            </label>
            <input
              id="condoAddress"
              type="text"
              formControlName="address"
              class="input input-bordered w-full"
              [class.input-error]="form.controls.address.touched && form.controls.address.invalid"
              placeholder="Ej: Av. Principal 123, Lima"
            />
            @if (form.controls.address.touched && form.controls.address.hasError('required')) {
              <label class="label">
                <span class="label-text-alt text-error">La direccion es obligatoria</span>
              </label>
            }
          </div>

          <div class="form-control">
            <label class="label" for="condoCountry">
              <span class="label-text">Pais</span>
            </label>
            <input
              id="condoCountry"
              type="text"
              formControlName="country"
              class="input input-bordered w-full"
              [class.input-error]="form.controls.country.touched && form.controls.country.invalid"
              placeholder="Ej: Peru"
            />
            @if (form.controls.country.touched && form.controls.country.hasError('required')) {
              <label class="label">
                <span class="label-text-alt text-error">El pais es obligatorio</span>
              </label>
            }
          </div>

          <div class="form-control">
            <label class="label cursor-pointer justify-start gap-3">
              <input
                type="checkbox"
                formControlName="hasBlocks"
                class="checkbox checkbox-primary checkbox-sm"
              />
              <span class="label-text">Tiene bloques / edificios</span>
            </label>
            <p class="text-xs text-base-content/50 ml-9">
              Desactiva esta opcion si tu condominio no tiene edificios separados
            </p>
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
              {{ isEdit() ? 'Guardar cambios' : 'Crear condominio' }}
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
export class CondoFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly condoService = inject(CondominiumService);
  private readonly toast = inject(ToastService);

  readonly saved = output<void>();
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly isEdit = signal(false);

  private editId: string | null = null;
  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    address: ['', [Validators.required, Validators.maxLength(250)]],
    country: ['', [Validators.required, Validators.maxLength(100)]],
    hasBlocks: [true],
  });

  openCreate(): void {
    this.isEdit.set(false);
    this.editId = null;
    this.form.reset({ hasBlocks: true });
    this.errorMessage.set('');
    this.dialogRef().nativeElement.showModal();
  }

  openEdit(condo: CondominiumResponse): void {
    this.isEdit.set(true);
    this.editId = condo.id;
    this.errorMessage.set('');
    this.form.patchValue({
      name: condo.name,
      address: condo.address,
      country: condo.country,
      hasBlocks: condo.includeBlocks,
    });
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
    const data = this.form.getRawValue();

    const onSuccess = () => {
      this.loading.set(false);
      this.toast.success(this.isEdit() ? 'Condominio actualizado' : 'Condominio creado exitosamente');
      this.saved.emit();
      this.close();
    };

    const onError = (err: any) => {
      this.loading.set(false);
      this.errorMessage.set(
        err.error?.message ?? 'Ocurrio un error. Intente de nuevo.',
      );
    };

    if (this.isEdit()) {
      this.condoService.update(this.editId!, data).subscribe({ next: onSuccess, error: onError });
    } else {
      this.condoService.create(data).subscribe({ next: onSuccess, error: onError });
    }
  }
}
