import { Component, ElementRef, inject, OnInit, output, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReservationService } from '../../services/reservation.service';
import { CommonAreaService } from '../../services/common-area.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { Reservation } from '../../models/reservation.model';

interface ComboItem {
  id: string;
  value: string;
}

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <dialog #dialog class="modal">
      <div class="modal-box w-full max-w-lg">
        <h3 class="text-lg font-bold">Nueva reserva</h3>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="mt-4 space-y-4">
          <div class="form-control">
            <label class="label" for="resCommonArea">
              <span class="label-text">Area comun</span>
            </label>
            <select
              id="resCommonArea"
              formControlName="commonAreaId"
              class="select select-bordered w-full"
              [class.select-error]="form.controls.commonAreaId.touched && form.controls.commonAreaId.invalid"
              (change)="onAreaOrDateChange()"
            >
              <option value="">Seleccione un area</option>
              @for (area of areas(); track area.id) {
                <option [value]="area.id">{{ area.value }}</option>
              }
            </select>
            @if (form.controls.commonAreaId.touched && form.controls.commonAreaId.hasError('required')) {
              <label class="label">
                <span class="label-text-alt text-error">Debe seleccionar un area</span>
              </label>
            }
          </div>

          <div class="form-control">
            <label class="label" for="resDate">
              <span class="label-text">Fecha de reserva</span>
            </label>
            <input
              id="resDate"
              type="date"
              formControlName="reservationDate"
              class="input input-bordered w-full"
              [class.input-error]="form.controls.reservationDate.touched && form.controls.reservationDate.invalid"
              (change)="onAreaOrDateChange()"
            />
            @if (form.controls.reservationDate.touched && form.controls.reservationDate.hasError('required')) {
              <label class="label">
                <span class="label-text-alt text-error">La fecha es obligatoria</span>
              </label>
            }
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label" for="resStartTime">
                <span class="label-text">Hora inicio</span>
              </label>
              <input
                id="resStartTime"
                type="time"
                formControlName="startTime"
                class="input input-bordered w-full"
                [class.input-error]="form.controls.startTime.touched && form.controls.startTime.invalid"
              />
              @if (form.controls.startTime.touched && form.controls.startTime.hasError('required')) {
                <label class="label">
                  <span class="label-text-alt text-error">Obligatorio</span>
                </label>
              }
            </div>

            <div class="form-control">
              <label class="label" for="resEndTime">
                <span class="label-text">Hora fin</span>
              </label>
              <input
                id="resEndTime"
                type="time"
                formControlName="endTime"
                class="input input-bordered w-full"
                [class.input-error]="form.controls.endTime.touched && form.controls.endTime.invalid"
              />
              @if (form.controls.endTime.touched && form.controls.endTime.hasError('required')) {
                <label class="label">
                  <span class="label-text-alt text-error">Obligatorio</span>
                </label>
              }
            </div>
          </div>

          <!-- Availability info -->
          @if (existingReservations().length > 0) {
            <div class="alert alert-info">
              <div>
                <p class="font-semibold text-sm">Reservas existentes para esa fecha:</p>
                <ul class="text-xs mt-1 space-y-0.5">
                  @for (r of existingReservations(); track r.id) {
                    <li>{{ r.startTime }} - {{ r.endTime }} ({{ r.reservedByUserName }})</li>
                  }
                </ul>
              </div>
            </div>
          }

          @if (availabilityChecked() && existingReservations().length === 0) {
            <div class="alert alert-success">
              <span class="text-sm">No hay reservas para esa fecha. Horario libre.</span>
            </div>
          }

          <div class="form-control">
            <label class="label" for="resNotes">
              <span class="label-text">Notas (opcional)</span>
            </label>
            <textarea
              id="resNotes"
              formControlName="notes"
              class="textarea textarea-bordered w-full"
              placeholder="Informacion adicional"
              rows="2"
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
              Crear reserva
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
export class ReservationFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly reservationService = inject(ReservationService);
  private readonly commonAreaService = inject(CommonAreaService);
  private readonly toast = inject(ToastService);

  readonly saved = output<void>();
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly areas = signal<ComboItem[]>([]);
  readonly existingReservations = signal<Reservation[]>([]);
  readonly availabilityChecked = signal(false);

  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  readonly form = this.fb.nonNullable.group({
    commonAreaId: ['', [Validators.required]],
    reservationDate: ['', [Validators.required]],
    startTime: ['', [Validators.required]],
    endTime: ['', [Validators.required]],
    notes: [''],
  });

  ngOnInit(): void {
    this.loadAreas();
  }

  private loadAreas(): void {
    this.commonAreaService.getComboList().subscribe({
      next: (items) => this.areas.set(items),
    });
  }

  openCreate(): void {
    this.form.reset();
    this.errorMessage.set('');
    this.existingReservations.set([]);
    this.availabilityChecked.set(false);
    this.loadAreas();
    this.dialogRef().nativeElement.showModal();
  }

  close(): void {
    this.dialogRef().nativeElement.close();
  }

  onAreaOrDateChange(): void {
    const areaId = this.form.controls.commonAreaId.value;
    const date = this.form.controls.reservationDate.value;

    if (!areaId || !date) {
      this.existingReservations.set([]);
      this.availabilityChecked.set(false);
      return;
    }

    this.reservationService.checkAvailability(areaId, date).subscribe({
      next: (res) => {
        this.existingReservations.set(res.existingReservations);
        this.availabilityChecked.set(true);
      },
    });
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
      commonAreaId: raw.commonAreaId,
      reservationDate: raw.reservationDate,
      startTime: raw.startTime + ':00',
      endTime: raw.endTime + ':00',
      notes: raw.notes || null,
    };

    this.reservationService.create(data).subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.success('Reserva creada (pendiente de aprobacion)');
        this.saved.emit();
        this.close();
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(
          err.error?.message ?? 'Ocurrio un error. Intente de nuevo.',
        );
      },
    });
  }
}
