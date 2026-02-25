import { Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { CommonAreaService } from '../../services/common-area.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { CommonArea } from '../../models/common-area.model';
import { CommonAreaFormComponent } from '../../components/common-area-form/common-area-form.component';
import { CommonAreaTabsComponent } from '../../components/common-area-tabs/common-area-tabs.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-common-area-list',
  standalone: true,
  imports: [CommonAreaFormComponent, CommonAreaTabsComponent, PaginationComponent, ConfirmDialogComponent, CurrencyPipe],
  templateUrl: './common-area-list.page.html',
})
export class CommonAreaListPage implements OnInit {
  private readonly commonAreaService = inject(CommonAreaService);
  private readonly toast = inject(ToastService);

  readonly areas = signal<CommonArea[]>([]);
  readonly loading = signal(false);
  readonly pageNumber = signal(1);
  readonly pageSize = signal(20);
  readonly totalCount = signal(0);
  readonly totalPages = signal(0);

  private areaToDelete: CommonArea | null = null;

  readonly areaForm = viewChild.required(CommonAreaFormComponent);
  readonly confirmDialog = viewChild.required(ConfirmDialogComponent);

  ngOnInit(): void {
    this.loadAreas();
  }

  loadAreas(): void {
    this.loading.set(true);
    this.commonAreaService.getAll(this.pageNumber(), this.pageSize()).subscribe({
      next: (res) => {
        this.areas.set(res.items);
        this.totalCount.set(res.totalCount);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Error al cargar las areas comunes');
        this.loading.set(false);
      },
    });
  }

  onPageChange(page: number): void {
    this.pageNumber.set(page);
    this.loadAreas();
  }

  onCreate(): void {
    this.areaForm().openCreate();
  }

  onEdit(area: CommonArea): void {
    this.areaForm().openEdit(area);
  }

  onDeleteRequest(area: CommonArea): void {
    this.areaToDelete = area;
    this.confirmDialog().open();
  }

  onDeleteConfirmed(): void {
    if (!this.areaToDelete) return;
    const id = this.areaToDelete.id;
    this.areaToDelete = null;

    this.commonAreaService.delete(id).subscribe({
      next: () => {
        this.toast.success('Area eliminada');
        this.loadAreas();
      },
      error: (err) => {
        this.toast.error(err.error?.message ?? 'Error al eliminar el area');
      },
    });
  }

  onFormSaved(): void {
    this.loadAreas();
  }
}
