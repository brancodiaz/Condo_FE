import { Component, ElementRef, inject, OnInit, output, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonAreaService } from '../../services/common-area.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { CommonArea } from '../../models/common-area.model';
import { BlockService } from '../../../blocks/services/block.service';

interface ComboItem {
  id: string;
  value: string;
}

@Component({
  selector: 'app-common-area-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <dialog #dialog class="modal">
      <div class="modal-box max-w-lg">
        <h3 class="text-lg font-bold">{{ isEdit() ? 'Editar area comun' : 'Nueva area comun' }}</h3>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="mt-4 space-y-4">
          <div class="form-control">
            <label class="label" for="areaName">
              <span class="label-text">Nombre</span>
            </label>
            <input
              id="areaName"
              type="text"
              formControlName="name"
              class="input input-bordered w-full"
              [class.input-error]="form.controls.name.touched && form.controls.name.invalid"
              placeholder="Ej: Piscina, Salon de eventos"
            />
            @if (form.controls.name.touched && form.controls.name.hasError('required')) {
              <label class="label">
                <span class="label-text-alt text-error">El nombre es obligatorio</span>
              </label>
            }
          </div>

          <div class="form-control">
            <label class="label" for="areaDescription">
              <span class="label-text">Descripcion (opcional)</span>
            </label>
            <textarea
              id="areaDescription"
              formControlName="description"
              class="textarea textarea-bordered w-full"
              placeholder="Descripcion del area comun"
              rows="2"
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label" for="areaBlockId">
                <span class="label-text">Bloque (opcional)</span>
              </label>
              <select
                id="areaBlockId"
                formControlName="blockId"
                class="select select-bordered w-full"
              >
                <option [ngValue]="null">Todo el condominio</option>
                @for (block of blocks(); track block.id) {
                  <option [value]="block.id">{{ block.value }}</option>
                }
              </select>
            </div>

            <div class="form-control">
              <label class="label" for="areaCapacity">
                <span class="label-text">Capacidad (opcional)</span>
              </label>
              <input
                id="areaCapacity"
                type="number"
                formControlName="capacity"
                class="input input-bordered w-full"
                placeholder="Ej: 50"
                min="1"
              />
            </div>
          </div>

          <div class="form-control">
            <label class="label cursor-pointer justify-start gap-3">
              <input
                type="checkbox"
                formControlName="hasCost"
                class="checkbox checkbox-primary checkbox-sm"
              />
              <span class="label-text">Tiene costo de reserva</span>
            </label>
          </div>

          @if (form.controls.hasCost.value) {
            <div class="grid grid-cols-2 gap-4">
              <div class="form-control">
                <label class="label" for="areaCostAmount">
                  <span class="label-text">Monto</span>
                </label>
                <input
                  id="areaCostAmount"
                  type="number"
                  formControlName="costAmount"
                  class="input input-bordered w-full"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div class="form-control">
                <label class="label" for="areaCurrency">
                  <span class="label-text">Moneda</span>
                </label>
                <select
                  id="areaCurrency"
                  formControlName="currency"
                  class="select select-bordered w-full"
                >
                  <option value="PEN">PEN (Soles)</option>
                  <option value="USD">USD (Dolares)</option>
                </select>
              </div>
            </div>
          }

          <div class="form-control">
            <label class="label" for="areaRules">
              <span class="label-text">Reglas de uso (opcional)</span>
            </label>
            <textarea
              id="areaRules"
              formControlName="rules"
              class="textarea textarea-bordered w-full"
              placeholder="Reglas y restricciones de uso"
              rows="3"
            ></textarea>
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
              {{ isEdit() ? 'Guardar cambios' : 'Crear area' }}
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
export class CommonAreaFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly commonAreaService = inject(CommonAreaService);
  private readonly blockService = inject(BlockService);
  private readonly toast = inject(ToastService);

  readonly saved = output<void>();
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly isEdit = signal(false);
  readonly blocks = signal<ComboItem[]>([]);

  private editId: string | null = null;
  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    description: [''],
    blockId: [null as string | null],
    capacity: [null as number | null],
    hasCost: [false],
    costAmount: [null as number | null],
    currency: ['PEN'],
    rules: [''],
  });

  ngOnInit(): void {
    this.loadBlocks();
  }

  private loadBlocks(): void {
    this.blockService.getAll(1, 100).subscribe({
      next: (res) => {
        this.blocks.set(
          res.items.map((b) => ({ id: b.id, value: b.name }))
        );
      },
    });
  }

  openCreate(): void {
    this.isEdit.set(false);
    this.editId = null;
    this.form.reset({ blockId: null, capacity: null, hasCost: false, costAmount: null, currency: 'PEN' });
    this.errorMessage.set('');
    this.dialogRef().nativeElement.showModal();
  }

  openEdit(area: CommonArea): void {
    this.isEdit.set(true);
    this.editId = area.id;
    this.errorMessage.set('');
    this.loading.set(true);

    this.commonAreaService.getById(area.id).subscribe({
      next: (detail) => {
        this.form.patchValue({
          name: detail.name,
          description: detail.description ?? '',
          blockId: detail.blockId ?? null,
          capacity: detail.capacity ?? null,
          hasCost: detail.hasCost,
          costAmount: detail.costAmount ?? null,
          currency: detail.currency ?? 'PEN',
          rules: detail.rules ?? '',
        });
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Error al cargar los datos del area');
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
    const raw = this.form.getRawValue();

    const data = {
      name: raw.name,
      description: raw.description || null,
      blockId: raw.blockId || null,
      capacity: raw.capacity || null,
      hasCost: raw.hasCost,
      costAmount: raw.hasCost ? raw.costAmount : null,
      currency: raw.hasCost ? raw.currency : null,
      rules: raw.rules || null,
    };

    const onSuccess = () => {
      this.loading.set(false);
      this.toast.success(this.isEdit() ? 'Area actualizada' : 'Area creada');
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
      this.commonAreaService.update(this.editId!, data).subscribe({ next: onSuccess, error: onError });
    } else {
      this.commonAreaService.create(data).subscribe({ next: onSuccess, error: onError });
    }
  }
}
