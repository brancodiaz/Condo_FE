import { Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { UnitService } from '../../services/unit.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { UnitSummary } from '../../models/unit.model';
import { UnitFormComponent } from '../../components/unit-form/unit-form.component';
import { UnitTypeManagerComponent } from '../../components/unit-type-manager/unit-type-manager.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-unit-list',
  standalone: true,
  imports: [UnitFormComponent, UnitTypeManagerComponent, PaginationComponent, ConfirmDialogComponent],
  templateUrl: './unit-list.page.html',
})
export class UnitListPage implements OnInit {
  private readonly unitService = inject(UnitService);
  private readonly toast = inject(ToastService);

  readonly units = signal<UnitSummary[]>([]);
  readonly loading = signal(false);
  readonly pageNumber = signal(1);
  readonly pageSize = signal(20);
  readonly totalCount = signal(0);
  readonly totalPages = signal(0);

  private unitToDelete: UnitSummary | null = null;

  readonly unitForm = viewChild.required(UnitFormComponent);
  readonly unitTypeManager = viewChild.required(UnitTypeManagerComponent);
  readonly confirmDialog = viewChild.required(ConfirmDialogComponent);

  ngOnInit(): void {
    this.loadUnits();
  }

  loadUnits(): void {
    this.loading.set(true);
    this.unitService.getPagedSummary(this.pageNumber(), this.pageSize()).subscribe({
      next: (res) => {
        this.units.set(res.items);
        this.totalCount.set(res.totalCount);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Error al cargar las unidades');
        this.loading.set(false);
      },
    });
  }

  onPageChange(page: number): void {
    this.pageNumber.set(page);
    this.loadUnits();
  }

  onCreate(): void {
    this.unitForm().openCreate();
  }

  onEdit(unit: UnitSummary): void {
    this.unitForm().openEdit(unit.unitId);
  }

  onDeleteRequest(unit: UnitSummary): void {
    this.unitToDelete = unit;
    this.confirmDialog().open();
  }

  onDeleteConfirmed(): void {
    if (!this.unitToDelete) return;
    const id = this.unitToDelete.unitId;
    this.unitToDelete = null;

    this.unitService.delete(id).subscribe({
      next: () => {
        this.toast.success('Unidad eliminada');
        this.loadUnits();
      },
      error: (err: any) => {
        this.toast.error(err.error?.message ?? 'Error al eliminar la unidad');
      },
    });
  }

  onManageTypes(): void {
    this.unitTypeManager().open();
  }

  onTypesChanged(): void {
    // Refresh form combo when types change
    this.unitForm().loadUnitTypes();
  }

  onFormSaved(): void {
    this.loadUnits();
  }
}
