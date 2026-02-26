import { Component, ElementRef, inject, OnInit, output, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaintenanceFeeService, ComboItem } from '../../services/maintenance-fee.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { MaintenanceFee, FREQUENCY_OPTIONS } from '../../models/maintenance-fee.model';
import { BlockService } from '../../../blocks/services/block.service';

@Component({
  selector: 'app-fee-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <dialog #dialog class="modal">
      <div class="modal-box w-full max-w-lg">
        <h3 class="text-lg font-bold">{{ isEdit() ? 'Editar cuota' : 'Nueva cuota' }}</h3>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="mt-4 space-y-4">
          <div class="form-control">
            <label class="label" for="feeName">
              <span class="label-text">Nombre</span>
            </label>
            <input
              id="feeName"
              type="text"
              formControlName="name"
              class="input input-bordered w-full"
              [class.input-error]="form.controls.name.touched && form.controls.name.invalid"
              placeholder="Ej: Cuota Mensual Enero 2026"
            />
            @if (form.controls.name.touched && form.controls.name.hasError('required')) {
              <label class="label">
                <span class="label-text-alt text-error">El nombre es obligatorio</span>
              </label>
            }
          </div>

          <div class="form-control">
            <label class="label" for="feeDescription">
              <span class="label-text">Descripcion (opcional)</span>
            </label>
            <textarea
              id="feeDescription"
              formControlName="description"
              class="textarea textarea-bordered w-full"
              placeholder="Descripcion de la cuota"
              rows="2"
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label" for="feeAmount">
                <span class="label-text">Monto</span>
              </label>
              <input
                id="feeAmount"
                type="number"
                formControlName="amount"
                class="input input-bordered w-full"
                [class.input-error]="form.controls.amount.touched && form.controls.amount.invalid"
                placeholder="0.00"
                step="0.01"
                min="0.01"
              />
              @if (form.controls.amount.touched && form.controls.amount.hasError('required')) {
                <label class="label">
                  <span class="label-text-alt text-error">El monto es obligatorio</span>
                </label>
              }
              @if (form.controls.amount.touched && form.controls.amount.hasError('min')) {
                <label class="label">
                  <span class="label-text-alt text-error">El monto debe ser mayor a 0</span>
                </label>
              }
            </div>

            <div class="form-control">
              <label class="label" for="feeFrequency">
                <span class="label-text">Frecuencia</span>
              </label>
              <select
                id="feeFrequency"
                formControlName="frequency"
                class="select select-bordered w-full"
                [class.select-error]="form.controls.frequency.touched && form.controls.frequency.invalid"
              >
                <option value="" disabled>Seleccionar</option>
                @for (opt of frequencyOptions; track opt.value) {
                  <option [value]="opt.value">{{ opt.label }}</option>
                }
              </select>
              @if (form.controls.frequency.touched && form.controls.frequency.hasError('required')) {
                <label class="label">
                  <span class="label-text-alt text-error">La frecuencia es obligatoria</span>
                </label>
              }
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label" for="feeEffectiveFrom">
                <span class="label-text">Vigencia desde</span>
              </label>
              <input
                id="feeEffectiveFrom"
                type="date"
                formControlName="effectiveFrom"
                class="input input-bordered w-full"
                [class.input-error]="form.controls.effectiveFrom.touched && form.controls.effectiveFrom.invalid"
              />
              @if (form.controls.effectiveFrom.touched && form.controls.effectiveFrom.hasError('required')) {
                <label class="label">
                  <span class="label-text-alt text-error">La fecha de inicio es obligatoria</span>
                </label>
              }
            </div>

            <div class="form-control">
              <label class="label" for="feeEffectiveTo">
                <span class="label-text">Vigencia hasta (opcional)</span>
              </label>
              <input
                id="feeEffectiveTo"
                type="date"
                formControlName="effectiveTo"
                class="input input-bordered w-full"
              />
            </div>
          </div>

          <div class="form-control">
            <label class="label" for="feeBlockId">
              <span class="label-text">Bloque (opcional - dejar vacio para todo el condominio)</span>
            </label>
            <select
              id="feeBlockId"
              formControlName="blockId"
              class="select select-bordered w-full"
            >
              <option [ngValue]="null">Todo el condominio</option>
              @for (block of blocks(); track block.id) {
                <option [value]="block.id">{{ block.value }}</option>
              }
            </select>
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
              {{ isEdit() ? 'Guardar cambios' : 'Crear cuota' }}
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
export class FeeFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly feeService = inject(MaintenanceFeeService);
  private readonly blockService = inject(BlockService);
  private readonly toast = inject(ToastService);

  readonly saved = output<void>();
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly isEdit = signal(false);
  readonly blocks = signal<ComboItem[]>([]);
  readonly frequencyOptions = FREQUENCY_OPTIONS;

  private editId: string | null = null;
  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: [''],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    frequency: ['', [Validators.required]],
    effectiveFrom: ['', [Validators.required]],
    effectiveTo: [''],
    blockId: [null as string | null],
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
    this.form.reset({ amount: 0, blockId: null });
    this.errorMessage.set('');
    this.dialogRef().nativeElement.showModal();
  }

  openEdit(fee: MaintenanceFee): void {
    this.isEdit.set(true);
    this.editId = fee.id;
    this.errorMessage.set('');
    this.loading.set(true);

    this.feeService.getById(fee.id).subscribe({
      next: (detail) => {
        this.form.patchValue({
          name: detail.name,
          description: detail.description ?? '',
          amount: detail.amount,
          frequency: detail.frequency,
          effectiveFrom: detail.effectiveFrom ? detail.effectiveFrom.substring(0, 10) : '',
          effectiveTo: detail.effectiveTo ? detail.effectiveTo.substring(0, 10) : '',
          blockId: detail.blockId ?? null,
        });
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Error al cargar los datos de la cuota');
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
      ...raw,
      blockId: raw.blockId || null,
      effectiveTo: raw.effectiveTo || null,
    };

    const onSuccess = () => {
      this.loading.set(false);
      this.toast.success(this.isEdit() ? 'Cuota actualizada' : 'Cuota creada');
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
      this.feeService.update(this.editId!, data).subscribe({ next: onSuccess, error: onError });
    } else {
      this.feeService.create(data).subscribe({ next: onSuccess, error: onError });
    }
  }
}
