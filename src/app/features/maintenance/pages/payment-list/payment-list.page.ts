import { Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { MaintenancePaymentService } from '../../services/maintenance-payment.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { MaintenancePayment, PAYMENT_STATUS } from '../../models/maintenance-payment.model';
import { PaymentFormComponent } from '../../components/payment-form/payment-form.component';
import { PaymentReviewComponent } from '../../components/payment-review/payment-review.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MaintenanceTabsComponent } from '../../components/maintenance-tabs/maintenance-tabs.component';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [
    PaymentFormComponent,
    PaymentReviewComponent,
    PaginationComponent,
    ConfirmDialogComponent,
    MaintenanceTabsComponent,
    DatePipe,
    CurrencyPipe,
  ],
  templateUrl: './payment-list.page.html',
})
export class PaymentListPage implements OnInit {
  private readonly paymentService = inject(MaintenancePaymentService);
  private readonly toast = inject(ToastService);

  readonly payments = signal<MaintenancePayment[]>([]);
  readonly loading = signal(false);
  readonly pageNumber = signal(1);
  readonly pageSize = signal(20);
  readonly totalCount = signal(0);
  readonly totalPages = signal(0);

  private paymentToDelete: MaintenancePayment | null = null;

  readonly paymentForm = viewChild.required(PaymentFormComponent);
  readonly paymentReview = viewChild.required(PaymentReviewComponent);
  readonly confirmDialog = viewChild.required(ConfirmDialogComponent);

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.loading.set(true);
    this.paymentService.getAll(this.pageNumber(), this.pageSize()).subscribe({
      next: (res) => {
        this.payments.set(res.items);
        this.totalCount.set(res.totalCount);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Error al cargar los pagos');
        this.loading.set(false);
      },
    });
  }

  getStatusLabel(status: string): string {
    return PAYMENT_STATUS[status]?.label ?? status;
  }

  getStatusBadge(status: string): string {
    return PAYMENT_STATUS[status]?.badge ?? 'badge-ghost';
  }

  onPageChange(page: number): void {
    this.pageNumber.set(page);
    this.loadPayments();
  }

  onCreate(): void {
    this.paymentForm().open();
  }

  onReview(payment: MaintenancePayment): void {
    this.paymentReview().open(payment);
  }

  onDeleteRequest(payment: MaintenancePayment): void {
    this.paymentToDelete = payment;
    this.confirmDialog().open();
  }

  onDeleteConfirmed(): void {
    if (!this.paymentToDelete) return;
    const id = this.paymentToDelete.id;
    this.paymentToDelete = null;

    this.paymentService.delete(id).subscribe({
      next: () => {
        this.toast.success('Pago eliminado');
        this.loadPayments();
      },
      error: (err) => {
        this.toast.error(err.error?.message ?? 'Error al eliminar el pago');
      },
    });
  }

  onFormSaved(): void {
    this.loadPayments();
  }

  onReviewed(): void {
    this.loadPayments();
  }
}
