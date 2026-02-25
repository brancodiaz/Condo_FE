import { Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { ReservationService } from '../../services/reservation.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { Reservation, RESERVATION_STATUS_LABELS, RESERVATION_STATUS_BADGE } from '../../models/reservation.model';
import { ReservationFormComponent } from '../../components/reservation-form/reservation-form.component';
import { ReservationReviewComponent } from '../../components/reservation-review/reservation-review.component';
import { CommonAreaTabsComponent } from '../../components/common-area-tabs/common-area-tabs.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-reservation-list',
  standalone: true,
  imports: [
    ReservationFormComponent,
    ReservationReviewComponent,
    CommonAreaTabsComponent,
    PaginationComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './reservation-list.page.html',
})
export class ReservationListPage implements OnInit {
  private readonly reservationService = inject(ReservationService);
  private readonly toast = inject(ToastService);

  readonly reservations = signal<Reservation[]>([]);
  readonly loading = signal(false);
  readonly pageNumber = signal(1);
  readonly pageSize = signal(20);
  readonly totalCount = signal(0);
  readonly totalPages = signal(0);
  readonly pendingCount = signal(0);

  private reservationToDelete: Reservation | null = null;
  private reservationToCancel: Reservation | null = null;

  readonly reservationForm = viewChild.required(ReservationFormComponent);
  readonly reservationReview = viewChild.required(ReservationReviewComponent);
  readonly confirmDialog = viewChild.required(ConfirmDialogComponent);

  private confirmAction: 'delete' | 'cancel' = 'delete';
  confirmTitle = 'Eliminar reserva';
  confirmMessage = 'Esta seguro de que desea eliminar esta reserva?';
  confirmText = 'Eliminar';

  ngOnInit(): void {
    this.loadReservations();
    this.loadPendingCount();
  }

  loadReservations(): void {
    this.loading.set(true);
    this.reservationService.getAll(this.pageNumber(), this.pageSize()).subscribe({
      next: (res) => {
        this.reservations.set(res.items);
        this.totalCount.set(res.totalCount);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Error al cargar las reservas');
        this.loading.set(false);
      },
    });
  }

  private loadPendingCount(): void {
    this.reservationService.getPending(1, 1).subscribe({
      next: (res) => this.pendingCount.set(res.totalCount),
    });
  }

  getStatusLabel(status: string): string {
    return RESERVATION_STATUS_LABELS[status] ?? status;
  }

  getStatusBadge(status: string): string {
    return RESERVATION_STATUS_BADGE[status] ?? 'badge-ghost';
  }

  onPageChange(page: number): void {
    this.pageNumber.set(page);
    this.loadReservations();
  }

  onCreate(): void {
    this.reservationForm().openCreate();
  }

  onReview(reservation: Reservation): void {
    this.reservationReview().open(reservation);
  }

  onCancelRequest(reservation: Reservation): void {
    this.reservationToCancel = reservation;
    this.confirmAction = 'cancel';
    this.confirmTitle = 'Cancelar reserva';
    this.confirmMessage = 'Esta seguro de que desea cancelar esta reserva?';
    this.confirmText = 'Cancelar reserva';
    this.confirmDialog().open();
  }

  onDeleteRequest(reservation: Reservation): void {
    this.reservationToDelete = reservation;
    this.confirmAction = 'delete';
    this.confirmTitle = 'Eliminar reserva';
    this.confirmMessage = 'Esta seguro de que desea eliminar esta reserva? Esta accion no se puede deshacer.';
    this.confirmText = 'Eliminar';
    this.confirmDialog().open();
  }

  onConfirmed(): void {
    if (this.confirmAction === 'cancel') {
      this.onCancelConfirmed();
    } else {
      this.onDeleteConfirmed();
    }
  }

  private onCancelConfirmed(): void {
    if (!this.reservationToCancel) return;
    const id = this.reservationToCancel.id;
    this.reservationToCancel = null;

    this.reservationService.cancel(id).subscribe({
      next: () => {
        this.toast.success('Reserva cancelada');
        this.loadReservations();
        this.loadPendingCount();
      },
      error: (err) => {
        this.toast.error(err.error?.message ?? 'Error al cancelar la reserva');
      },
    });
  }

  private onDeleteConfirmed(): void {
    if (!this.reservationToDelete) return;
    const id = this.reservationToDelete.id;
    this.reservationToDelete = null;

    this.reservationService.delete(id).subscribe({
      next: () => {
        this.toast.success('Reserva eliminada');
        this.loadReservations();
        this.loadPendingCount();
      },
      error: (err) => {
        this.toast.error(err.error?.message ?? 'Error al eliminar la reserva');
      },
    });
  }

  onFormSaved(): void {
    this.loadReservations();
    this.loadPendingCount();
  }

  onReviewed(): void {
    this.loadReservations();
    this.loadPendingCount();
  }
}
