import { Component, ElementRef, inject, output, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { MaintenancePaymentService } from '../../services/maintenance-payment.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { MaintenancePayment, PAYMENT_STATUS } from '../../models/maintenance-payment.model';

@Component({
  selector: 'app-payment-review',
  standalone: true,
  imports: [FormsModule, DatePipe, CurrencyPipe],
  template: `
    <dialog #dialog class="modal">
      <div class="modal-box max-w-lg">
        <h3 class="text-lg font-bold">Detalle del pago</h3>

        @if (payment()) {
          <div class="mt-4 space-y-3">
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span class="text-base-content/50">Cuota:</span>
                <p class="font-medium">{{ payment()!.maintenanceFeeName }}</p>
              </div>
              <div>
                <span class="text-base-content/50">Unidad:</span>
                <p class="font-medium">{{ payment()!.unitName ?? 'N/A' }}</p>
              </div>
              <div>
                <span class="text-base-content/50">Pagado por:</span>
                <p class="font-medium">{{ payment()!.paidByName ?? 'N/A' }}</p>
              </div>
              <div>
                <span class="text-base-content/50">Monto:</span>
                <p class="font-mono font-medium">{{ payment()!.amount | currency:'USD':'symbol':'1.2-2' }}</p>
              </div>
              <div>
                <span class="text-base-content/50">Periodos cubiertos:</span>
                <p class="font-medium">{{ payment()!.periodsCovered }}</p>
              </div>
              <div>
                <span class="text-base-content/50">Fecha de pago:</span>
                <p class="font-medium">{{ payment()!.paymentDate | date:'dd/MM/yyyy' }}</p>
              </div>
              <div>
                <span class="text-base-content/50">Periodo:</span>
                <p class="font-medium">{{ payment()!.periodStart | date:'dd/MM/yyyy' }} - {{ payment()!.periodEnd | date:'dd/MM/yyyy' }}</p>
              </div>
              <div>
                <span class="text-base-content/50">Estado:</span>
                <p>
                  <span class="badge {{ getStatusBadge(payment()!.status) }}">
                    {{ getStatusLabel(payment()!.status) }}
                  </span>
                </p>
              </div>
            </div>

            @if (payment()!.notes) {
              <div class="text-sm">
                <span class="text-base-content/50">Notas:</span>
                <p class="mt-1">{{ payment()!.notes }}</p>
              </div>
            }

            @if (payment()!.hasReceipt) {
              <div class="text-sm">
                <span class="text-base-content/50">Comprobante:</span>
                <p class="mt-1 text-primary">{{ payment()!.receiptFileName }}</p>
              </div>
            }

            @if (payment()!.rejectionReason) {
              <div class="alert alert-error">
                <span class="text-sm"><strong>Razon de rechazo:</strong> {{ payment()!.rejectionReason }}</span>
              </div>
            }

            @if (payment()!.reviewedByName) {
              <div class="text-sm text-base-content/50">
                Revisado por {{ payment()!.reviewedByName }} el {{ payment()!.reviewedAt | date:'dd/MM/yyyy HH:mm' }}
              </div>
            }

            <!-- Reject reason input -->
            @if (showRejectInput()) {
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Razon del rechazo</span>
                </label>
                <textarea
                  class="textarea textarea-bordered w-full"
                  [(ngModel)]="rejectionReason"
                  placeholder="Ingrese la razon del rechazo"
                  rows="3"
                ></textarea>
              </div>
            }
          </div>

          <div class="modal-action">
            <button type="button" class="btn btn-ghost" (click)="close()">Cerrar</button>
            @if (payment()!.status === 'PENDING') {
              @if (showRejectInput()) {
                <button
                  type="button"
                  class="btn btn-error"
                  [disabled]="loading() || !rejectionReason.trim()"
                  (click)="onReject()"
                >
                  @if (loading()) {
                    <span class="loading loading-spinner loading-sm"></span>
                  }
                  Confirmar rechazo
                </button>
              } @else {
                <button type="button" class="btn btn-error btn-outline" (click)="showRejectInput.set(true)">
                  Rechazar
                </button>
                <button type="button" class="btn btn-success" [disabled]="loading()" (click)="onApprove()">
                  @if (loading()) {
                    <span class="loading loading-spinner loading-sm"></span>
                  }
                  Aprobar
                </button>
              }
            }
          </div>
        }
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  `,
})
export class PaymentReviewComponent {
  private readonly paymentService = inject(MaintenancePaymentService);
  private readonly toast = inject(ToastService);

  readonly reviewed = output<void>();
  readonly loading = signal(false);
  readonly payment = signal<MaintenancePayment | null>(null);
  readonly showRejectInput = signal(false);
  rejectionReason = '';

  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  open(payment: MaintenancePayment): void {
    this.payment.set(payment);
    this.showRejectInput.set(false);
    this.rejectionReason = '';
    this.dialogRef().nativeElement.showModal();
  }

  close(): void {
    this.dialogRef().nativeElement.close();
  }

  getStatusLabel(status: string): string {
    return PAYMENT_STATUS[status]?.label ?? status;
  }

  getStatusBadge(status: string): string {
    return PAYMENT_STATUS[status]?.badge ?? 'badge-ghost';
  }

  onApprove(): void {
    const p = this.payment();
    if (!p) return;

    this.loading.set(true);
    this.paymentService.approve(p.id).subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.success('Pago aprobado');
        this.reviewed.emit();
        this.close();
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(err.error?.message ?? 'Error al aprobar el pago');
      },
    });
  }

  onReject(): void {
    const p = this.payment();
    if (!p || !this.rejectionReason.trim()) return;

    this.loading.set(true);
    this.paymentService.reject(p.id, { rejectionReason: this.rejectionReason.trim() }).subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.success('Pago rechazado');
        this.reviewed.emit();
        this.close();
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(err.error?.message ?? 'Error al rechazar el pago');
      },
    });
  }
}
