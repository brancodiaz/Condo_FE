import { Component, ElementRef, inject, OnInit, output, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UnitService } from '../../services/unit.service';
import { UnitTypeService } from '../../services/unit-type.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { ComboItem, Unit } from '../../models/unit.model';

@Component({
  selector: 'app-unit-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <dialog #dialog class="modal">
      <div class="modal-box w-full max-w-lg">
        <h3 class="text-lg font-bold">{{ isEdit() ? 'Editar unidad' : 'Nueva unidad' }}</h3>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="mt-4 space-y-4">
          <!-- Name -->
          <div class="form-control">
            <label class="label" for="unitName">
              <span class="label-text">Nombre / Identificador</span>
            </label>
            <input
              id="unitName"
              type="text"
              formControlName="name"
              class="input input-bordered w-full"
              [class.input-error]="form.controls.name.touched && form.controls.name.invalid"
              placeholder="Ej: Apto 101, Casa 5"
            />
            @if (form.controls.name.touched && form.controls.name.hasError('required')) {
              <label class="label">
                <span class="label-text-alt text-error">El nombre es obligatorio</span>
              </label>
            }
          </div>

          <!-- Unit Type -->
          <div class="form-control">
            <label class="label" for="unitType">
              <span class="label-text">Tipo de unidad</span>
            </label>
            <select
              id="unitType"
              formControlName="unitTypeId"
              class="select select-bordered w-full"
              [class.select-error]="form.controls.unitTypeId.touched && form.controls.unitTypeId.invalid"
            >
              <option [value]="0" disabled>Seleccione un tipo</option>
              @for (type of unitTypes(); track type.id) {
                <option [value]="type.id">{{ type.value }}</option>
              }
            </select>
            @if (form.controls.unitTypeId.touched && form.controls.unitTypeId.hasError('min')) {
              <label class="label">
                <span class="label-text-alt text-error">Seleccione un tipo de unidad</span>
              </label>
            }
          </div>

          <!-- Floor & Rooms -->
          <div class="grid grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label" for="unitFloor">
                <span class="label-text">Piso</span>
              </label>
              <input
                id="unitFloor"
                type="number"
                formControlName="floor"
                class="input input-bordered w-full"
                placeholder="0"
                min="0"
              />
            </div>
            <div class="form-control">
              <label class="label" for="unitRooms">
                <span class="label-text">Habitaciones</span>
              </label>
              <input
                id="unitRooms"
                type="number"
                formControlName="rooms"
                class="input input-bordered w-full"
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <!-- Square Meters -->
          <div class="form-control">
            <label class="label" for="unitSqm">
              <span class="label-text">Metros cuadrados</span>
            </label>
            <input
              id="unitSqm"
              type="number"
              formControlName="squareMeters"
              class="input input-bordered w-full"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
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
              {{ isEdit() ? 'Guardar cambios' : 'Crear unidad' }}
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
export class UnitFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly unitService = inject(UnitService);
  private readonly unitTypeService = inject(UnitTypeService);
  private readonly toast = inject(ToastService);

  readonly saved = output<void>();
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly isEdit = signal(false);
  readonly unitTypes = signal<ComboItem[]>([]);

  private editId: number | null = null;
  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    unitTypeId: [0, [Validators.required, Validators.min(1)]],
    floor: [0],
    rooms: [0],
    squareMeters: [0],
  });

  ngOnInit(): void {
    this.loadUnitTypes();
  }

  loadUnitTypes(): void {
    this.unitTypeService.getComboList().subscribe({
      next: (types) => this.unitTypes.set(types),
      error: () => this.toast.error('Error al cargar tipos de unidad'),
    });
  }

  openCreate(): void {
    this.isEdit.set(false);
    this.editId = null;
    this.form.reset({ name: '', unitTypeId: 0, floor: 0, rooms: 0, squareMeters: 0 });
    this.errorMessage.set('');
    this.loadUnitTypes();
    this.dialogRef().nativeElement.showModal();
  }

  openEdit(unitId: number): void {
    this.isEdit.set(true);
    this.editId = unitId;
    this.errorMessage.set('');
    this.loading.set(true);
    this.loadUnitTypes();

    this.unitService.getById(unitId).subscribe({
      next: (unit: Unit) => {
        this.form.patchValue({
          name: unit.name,
          unitTypeId: unit.unitTypeId,
          floor: unit.floor,
          rooms: unit.rooms,
          squareMeters: unit.squareMeters,
        });
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Error al cargar la unidad');
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

    const onSuccess = () => {
      this.loading.set(false);
      this.toast.success(this.isEdit() ? 'Unidad actualizada' : 'Unidad creada');
      this.saved.emit();
      this.close();
    };

    const onError = (err: any) => {
      this.loading.set(false);
      this.errorMessage.set(err.error?.message ?? 'Ocurrio un error. Intente de nuevo.');
    };

    if (this.isEdit()) {
      this.unitService.update(this.editId!, { id: this.editId!, ...raw }).subscribe({ next: onSuccess, error: onError });
    } else {
      this.unitService.create(raw).subscribe({ next: onSuccess, error: onError });
    }
  }
}
