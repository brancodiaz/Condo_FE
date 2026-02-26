import { Component, ElementRef, inject, output, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IncidentTypeService } from '../../services/incident-type.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { IncidentType, ASSIGNMENT_TARGET_LABELS } from '../../models/incident-type.model';

@Component({
  selector: 'app-incident-type-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <dialog #dialog class="modal">
      <div class="modal-box w-full max-w-lg">
        <h3 class="text-lg font-bold">{{ isEdit() ? 'Editar tipo de incidente' : 'Nuevo tipo de incidente' }}</h3>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="mt-4 space-y-4">
          <div class="form-control">
            <label class="label" for="itName">
              <span class="label-text">Nombre</span>
            </label>
            <input
              id="itName"
              type="text"
              formControlName="name"
              class="input input-bordered w-full"
              [class.input-error]="form.controls.name.touched && form.controls.name.invalid"
              placeholder="Ej: Fuga de agua, Ruido excesivo"
            />
            @if (form.controls.name.touched && form.controls.name.hasError('required')) {
              <label class="label">
                <span class="label-text-alt text-error">El nombre es obligatorio</span>
              </label>
            }
          </div>

          <div class="form-control">
            <label class="label" for="itDescription">
              <span class="label-text">Descripcion (opcional)</span>
            </label>
            <textarea
              id="itDescription"
              formControlName="description"
              class="textarea textarea-bordered w-full"
              placeholder="Descripcion del tipo de incidente"
              rows="2"
            ></textarea>
          </div>

          <div class="form-control">
            <label class="label" for="itTarget">
              <span class="label-text">Asignar a</span>
            </label>
            <select
              id="itTarget"
              formControlName="assignmentTarget"
              class="select select-bordered w-full"
            >
              @for (target of targetOptions; track target.value) {
                <option [value]="target.value">{{ target.label }}</option>
              }
            </select>
          </div>

          <div class="form-control">
            <label class="label cursor-pointer justify-start gap-3">
              <input
                type="checkbox"
                formControlName="allowPublicVisibility"
                class="checkbox checkbox-primary checkbox-sm"
              />
              <span class="label-text">Permitir visibilidad publica</span>
            </label>
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
              {{ isEdit() ? 'Guardar cambios' : 'Crear tipo' }}
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
export class IncidentTypeFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly incidentTypeService = inject(IncidentTypeService);
  private readonly toast = inject(ToastService);

  readonly saved = output<void>();
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly isEdit = signal(false);

  private editId: number | null = null;
  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  readonly targetOptions = Object.entries(ASSIGNMENT_TARGET_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    description: [''],
    assignmentTarget: ['CONDO_ADMIN'],
    allowPublicVisibility: [false],
  });

  openCreate(): void {
    this.isEdit.set(false);
    this.editId = null;
    this.form.reset({ assignmentTarget: 'CONDO_ADMIN', allowPublicVisibility: false });
    this.errorMessage.set('');
    this.dialogRef().nativeElement.showModal();
  }

  openEdit(type: IncidentType): void {
    this.isEdit.set(true);
    this.editId = type.id;
    this.errorMessage.set('');
    this.form.patchValue({
      name: type.name,
      description: type.description ?? '',
      assignmentTarget: type.assignmentTarget,
      allowPublicVisibility: type.allowPublicVisibility,
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
    const raw = this.form.getRawValue();

    const data = {
      name: raw.name,
      description: raw.description || null,
      assignmentTarget: raw.assignmentTarget,
      allowPublicVisibility: raw.allowPublicVisibility,
    };

    const onSuccess = () => {
      this.loading.set(false);
      this.toast.success(this.isEdit() ? 'Tipo actualizado' : 'Tipo creado');
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
      this.incidentTypeService.update(this.editId!, data).subscribe({ next: onSuccess, error: onError });
    } else {
      this.incidentTypeService.create(data).subscribe({ next: onSuccess, error: onError });
    }
  }
}
