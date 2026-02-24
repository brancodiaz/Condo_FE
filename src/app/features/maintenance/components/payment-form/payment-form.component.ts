import { Component, ElementRef, inject, OnInit, output, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaintenancePaymentService } from '../../services/maintenance-payment.service';
import { MaintenanceFeeService, ComboItem } from '../../services/maintenance-fee.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { UnitService } from '../../../units/services/unit.service';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <dialog #dialog class="modal">
      <div class="modal-box max-w-lg">
        <h3 class="text-lg font-bold">Registrar pago</h3>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="mt-4 space-y-4">
          <div class="form-control">
            <label class="label" for="payFee">
              <span class="label-text">Cuota</span>
            </label>
            <select
              id="payFee"
              formControlName="maintenanceFeeId"
              class="select select-bordered w-full"
              [class.select-error]="form.controls.maintenanceFeeId.touched && form.controls.maintenanceFeeId.invalid"
              (change)="onFeeSelected()"
            >
              <option value="" disabled>Seleccionar cuota</option>
              @for (fee of fees(); track fee.id) {
                <option [value]="fee.id">{{ fee.value }}</option>
              }
            </select>
            @if (form.controls.maintenanceFeeId.touched && form.controls.maintenanceFeeId.hasError('required')) {
              <label class="label">
                <span class="label-text-alt text-error">La cuota es obligatoria</span>
              </label>
            }
          </div>

          <div class="form-control">
            <label class="label" for="payUnit">
              <span class="label-text">Unidad</span>
            </label>
            <select
              id="payUnit"
              formControlName="unitId"
              class="select select-bordered w-full"
              [class.select-error]="form.controls.unitId.touched && form.controls.unitId.invalid"
            >
              <option [value]="0" disabled>Seleccionar unidad</option>
              @for (unit of units(); track unit.id) {
                <option [value]="unit.id">{{ unit.value }}</option>
              }
            </select>
            @if (form.controls.unitId.touched && form.controls.unitId.hasError('required')) {
              <label class="label">
                <span class="label-text-alt text-error">La unidad es obligatoria</span>
              </label>
            }
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label" for="payAmount">
                <span class="label-text">Monto</span>
              </label>
              <input
                id="payAmount"
                type="number"
                formControlName="amount"
                class="input input-bordered w-full"
                [class.input-error]="form.controls.amount.touched && form.controls.amount.invalid"
                step="0.01"
                min="0.01"
              />
              @if (form.controls.amount.touched && form.controls.amount.hasError('min')) {
                <label class="label">
                  <span class="label-text-alt text-error">El monto debe ser mayor a 0</span>
                </label>
              }
            </div>

            <div class="form-control">
              <label class="label" for="payPeriods">
                <span class="label-text">Periodos cubiertos</span>
              </label>
              <input
                id="payPeriods"
                type="number"
                formControlName="periodsCovered"
                class="input input-bordered w-full"
                min="1"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="form-control">
              <label class="label" for="payPeriodStart">
                <span class="label-text">Periodo desde</span>
              </label>
              <input
                id="payPeriodStart"
                type="date"
                formControlName="periodStart"
                class="input input-bordered w-full"
                [class.input-error]="form.controls.periodStart.touched && form.controls.periodStart.invalid"
              />
            </div>

            <div class="form-control">
              <label class="label" for="payPeriodEnd">
                <span class="label-text">Periodo hasta</span>
              </label>
              <input
                id="payPeriodEnd"
                type="date"
                formControlName="periodEnd"
                class="input input-bordered w-full"
                [class.input-error]="form.controls.periodEnd.touched && form.controls.periodEnd.invalid"
              />
            </div>
          </div>

          <div class="form-control">
            <label class="label" for="payDate">
              <span class="label-text">Fecha de pago</span>
            </label>
            <input
              id="payDate"
              type="date"
              formControlName="paymentDate"
              class="input input-bordered w-full"
              [class.input-error]="form.controls.paymentDate.touched && form.controls.paymentDate.invalid"
            />
          </div>

          <div class="form-control">
            <label class="label" for="payNotes">
              <span class="label-text">Notas (opcional)</span>
            </label>
            <textarea
              id="payNotes"
              formControlName="notes"
              class="textarea textarea-bordered w-full"
              placeholder="Ej: Transferencia bancaria ref. 123456"
              rows="2"
            ></textarea>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Comprobante (opcional)</span>
            </label>
            <input
              type="file"
              class="file-input file-input-bordered w-full"
              accept=".pdf,.jpg,.jpeg,.png"
              (change)="onFileSelected($event)"
            />
            <label class="label">
              <span class="label-text-alt text-base-content/40">PDF, JPG o PNG. Maximo 5MB</span>
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
              Registrar pago
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
export class PaymentFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly paymentService = inject(MaintenancePaymentService);
  private readonly feeService = inject(MaintenanceFeeService);
  private readonly unitService = inject(UnitService);
  private readonly toast = inject(ToastService);

  readonly saved = output<void>();
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly fees = signal<ComboItem[]>([]);
  readonly units = signal<{ id: number; value: string }[]>([]);

  private selectedFile: File | null = null;
  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  readonly form = this.fb.nonNullable.group({
    maintenanceFeeId: ['', [Validators.required]],
    unitId: [0, [Validators.required, Validators.min(1)]],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    periodsCovered: [1, [Validators.required, Validators.min(1)]],
    periodStart: ['', [Validators.required]],
    periodEnd: ['', [Validators.required]],
    paymentDate: ['', [Validators.required]],
    notes: [''],
  });

  ngOnInit(): void {
    this.loadDropdowns();
  }

  private loadDropdowns(): void {
    this.feeService.getComboList().subscribe({
      next: (fees) => this.fees.set(fees),
    });

    this.unitService.getAll(1, 100).subscribe({
      next: (res) => {
        this.units.set(
          res.items.map((u) => ({ id: u.id, value: u.name }))
        );
      },
    });
  }

  onFeeSelected(): void {
    const feeId = this.form.controls.maintenanceFeeId.value;
    if (feeId) {
      this.feeService.getById(feeId).subscribe({
        next: (fee) => {
          this.form.controls.amount.setValue(fee.amount);
        },
      });
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  open(): void {
    const today = new Date().toISOString().substring(0, 10);
    this.form.reset({ periodsCovered: 1, unitId: 0, amount: 0, paymentDate: today });
    this.selectedFile = null;
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
    const data = this.form.getRawValue();

    this.paymentService.create(data).subscribe({
      next: (paymentId) => {
        if (this.selectedFile) {
          this.paymentService.uploadReceipt(paymentId, this.selectedFile).subscribe({
            next: () => this.onSuccess(),
            error: () => {
              this.toast.warning('Pago registrado pero hubo un error al subir el comprobante');
              this.onSuccess();
            },
          });
        } else {
          this.onSuccess();
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message ?? 'Ocurrio un error. Intente de nuevo.');
      },
    });
  }

  private onSuccess(): void {
    this.loading.set(false);
    this.toast.success('Pago registrado. Pendiente de aprobacion.');
    this.saved.emit();
    this.close();
  }
}
