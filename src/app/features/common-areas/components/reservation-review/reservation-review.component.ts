import { Component, ElementRef, inject, output, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ReservationService } from '../../services/reservation.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { Reservation, RESERVATION_STATUS_LABELS, RESERVATION_STATUS_BADGE } from '../../models/reservation.model';

@Component({
  selector: 'app-reservation-review',
  standalone: true,
  imports: [FormsModule, DatePipe],
  template: `
    <dialog #dialog class="modal">
      <div class="modal-box max-w-lg">
        <h3 class="text-lg font-bold">Detalle de reserva</h3>

        @if (reservation()) {
          <div class="mt-4 space-y-3">
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span class="text-base-content/50">Area comun:</span>
                <p class="font-medium">{{ reservation()!.commonAreaName }}</p>
              </div>
              <div>
                <span class="text-base-content/50">Reservado por:</span>
                <p class="font-medium">{{ reservation()!.reservedByUserName }}</p>
              </div>
              <div>
                <span class="text-base-content/50">Fecha:</span>
                <p class="font-medium">{{ reservation()!.reservationDate }}</p>
              </div>
              <div>
                <span class="text-base-content/50">Horario:</span>
                <p class="font-medium">{{ reservation()!.startTime }} - {{ reservation()!.endTime }}</p>
              </div>
              <div>
                <span class="text-base-content/50">Estado:</span>
                <p>
                  <span class="badge {{ getStatusBadge(reservation()!.status) }}">
                    {{ getStatusLabel(reservation()!.status) }}
                  </span>
                </p>
              </div>
              @if (reservation()!.costAmount) {
                <div>
                  <span class="text-base-content/50">Costo:</span>
                  <p class="font-mono font-medium">{{ reservation()!.costAmount }}</p>
                </div>
              }
            </div>

            @if (reservation()!.notes) {
              <div class="text-sm">
                <span class="text-base-content/50">Notas:</span>
                <p class="mt-1">{{ reservation()!.notes }}</p>
              </div>
            }

            @if (reservation()!.rejectionReason) {
              <div class="alert alert-error">
                <span class="text-sm"><strong>Razon de rechazo:</strong> {{ reservation()!.rejectionReason }}</span>
              </div>
            }

            @if (reservation()!.reviewedByUserName) {
              <div class="text-sm text-base-content/50">
                Revisado por {{ reservation()!.reviewedByUserName }} el {{ reservation()!.reviewedAt | date:'dd/MM/yyyy HH:mm' }}
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
            @if (reservation()!.status === 'PENDING') {
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
export class ReservationReviewComponent {
  private readonly reservationService = inject(ReservationService);
  private readonly toast = inject(ToastService);

  readonly reviewed = output<void>();
  readonly loading = signal(false);
  readonly reservation = signal<Reservation | null>(null);
  readonly showRejectInput = signal(false);
  rejectionReason = '';

  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  open(reservation: Reservation): void {
    this.reservation.set(reservation);
    this.showRejectInput.set(false);
    this.rejectionReason = '';
    this.dialogRef().nativeElement.showModal();
  }

  close(): void {
    this.dialogRef().nativeElement.close();
  }

  getStatusLabel(status: string): string {
    return RESERVATION_STATUS_LABELS[status] ?? status;
  }

  getStatusBadge(status: string): string {
    return RESERVATION_STATUS_BADGE[status] ?? 'badge-ghost';
  }

  onApprove(): void {
    const r = this.reservation();
    if (!r) return;

    this.loading.set(true);
    this.reservationService.approve(r.id).subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.success('Reserva aprobada');
        this.reviewed.emit();
        this.close();
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(err.error?.message ?? 'Error al aprobar la reserva');
      },
    });
  }

  onReject(): void {
    const r = this.reservation();
    if (!r || !this.rejectionReason.trim()) return;

    this.loading.set(true);
    this.reservationService.reject(r.id, { rejectionReason: this.rejectionReason.trim() }).subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.success('Reserva rechazada');
        this.reviewed.emit();
        this.close();
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(err.error?.message ?? 'Error al rechazar la reserva');
      },
    });
  }
}
