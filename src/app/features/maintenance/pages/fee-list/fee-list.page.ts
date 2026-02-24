import { Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { MaintenanceFeeService } from '../../services/maintenance-fee.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { MaintenanceFee, FREQUENCY_LABELS } from '../../models/maintenance-fee.model';
import { FeeFormComponent } from '../../components/fee-form/fee-form.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MaintenanceTabsComponent } from '../../components/maintenance-tabs/maintenance-tabs.component';

@Component({
  selector: 'app-fee-list',
  standalone: true,
  imports: [FeeFormComponent, PaginationComponent, ConfirmDialogComponent, MaintenanceTabsComponent, DatePipe, CurrencyPipe],
  templateUrl: './fee-list.page.html',
})
export class FeeListPage implements OnInit {
  private readonly feeService = inject(MaintenanceFeeService);
  private readonly toast = inject(ToastService);

  readonly fees = signal<MaintenanceFee[]>([]);
  readonly loading = signal(false);
  readonly pageNumber = signal(1);
  readonly pageSize = signal(20);
  readonly totalCount = signal(0);
  readonly totalPages = signal(0);

  private feeToDelete: MaintenanceFee | null = null;

  readonly feeForm = viewChild.required(FeeFormComponent);
  readonly confirmDialog = viewChild.required(ConfirmDialogComponent);

  ngOnInit(): void {
    this.loadFees();
  }

  loadFees(): void {
    this.loading.set(true);
    this.feeService.getAll(this.pageNumber(), this.pageSize()).subscribe({
      next: (res) => {
        this.fees.set(res.items);
        this.totalCount.set(res.totalCount);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Error al cargar las cuotas');
        this.loading.set(false);
      },
    });
  }

  getFrequencyLabel(frequency: string): string {
    return FREQUENCY_LABELS[frequency] ?? frequency;
  }

  onPageChange(page: number): void {
    this.pageNumber.set(page);
    this.loadFees();
  }

  onCreate(): void {
    this.feeForm().openCreate();
  }

  onEdit(fee: MaintenanceFee): void {
    this.feeForm().openEdit(fee);
  }

  onDeleteRequest(fee: MaintenanceFee): void {
    this.feeToDelete = fee;
    this.confirmDialog().open();
  }

  onDeleteConfirmed(): void {
    if (!this.feeToDelete) return;
    const id = this.feeToDelete.id;
    this.feeToDelete = null;

    this.feeService.delete(id).subscribe({
      next: () => {
        this.toast.success('Cuota eliminada');
        this.loadFees();
      },
      error: (err) => {
        this.toast.error(err.error?.message ?? 'Error al eliminar la cuota');
      },
    });
  }

  onFormSaved(): void {
    this.loadFees();
  }
}
