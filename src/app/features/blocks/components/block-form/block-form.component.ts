import { Component, ElementRef, inject, output, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BlockService } from '../../services/block.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { Block } from '../../models/block.model';

@Component({
  selector: 'app-block-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <dialog #dialog class="modal">
      <div class="modal-box w-full sm:max-w-lg">
        <h3 class="text-lg font-bold">{{ isEdit() ? 'Editar bloque' : 'Nuevo bloque' }}</h3>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="mt-4 space-y-4">
          <div class="form-control">
            <label class="label" for="blockName">
              <span class="label-text">Nombre</span>
            </label>
            <input
              id="blockName"
              type="text"
              formControlName="name"
              class="input input-bordered w-full"
              [class.input-error]="form.controls.name.touched && form.controls.name.invalid"
              placeholder="Ej: Torre A, Bloque 1"
            />
            @if (form.controls.name.touched && form.controls.name.hasError('required')) {
              <label class="label">
                <span class="label-text-alt text-error">El nombre es obligatorio</span>
              </label>
            }
          </div>

          <div class="form-control">
            <label class="label" for="blockDescription">
              <span class="label-text">Descripcion</span>
            </label>
            <textarea
              id="blockDescription"
              formControlName="description"
              class="textarea textarea-bordered w-full"
              [class.textarea-error]="form.controls.description.touched && form.controls.description.invalid"
              placeholder="Descripcion del bloque"
              rows="3"
            ></textarea>
            @if (form.controls.description.touched && form.controls.description.hasError('required')) {
              <label class="label">
                <span class="label-text-alt text-error">La descripcion es obligatoria</span>
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
              {{ isEdit() ? 'Guardar cambios' : 'Crear bloque' }}
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
export class BlockFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly blockService = inject(BlockService);
  private readonly toast = inject(ToastService);

  readonly saved = output<void>();
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly isEdit = signal(false);

  private editId: string | null = null;
  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.required, Validators.maxLength(500)]],
  });

  openCreate(): void {
    this.isEdit.set(false);
    this.editId = null;
    this.form.reset();
    this.errorMessage.set('');
    this.dialogRef().nativeElement.showModal();
  }

  openEdit(block: Block): void {
    this.isEdit.set(true);
    this.editId = block.id;
    this.errorMessage.set('');
    this.loading.set(true);

    this.blockService.getById(block.id).subscribe({
      next: (detail: any) => {
        this.form.patchValue({
          name: detail.name,
          description: detail.description ?? '',
        });
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Error al cargar los datos del bloque');
        this.loading.set(false);
        this.close();
      },
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
      this.toast.success(this.isEdit() ? 'Bloque actualizado' : 'Bloque creado');
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
      this.blockService.update(this.editId!, data).subscribe({ next: onSuccess, error: onError });
    } else {
      this.blockService.create(data).subscribe({ next: onSuccess, error: onError });
    }
  }
}
