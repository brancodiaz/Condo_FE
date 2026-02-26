import { Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { IncidentTypeService } from '../../services/incident-type.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { IncidentType, ASSIGNMENT_TARGET_LABELS } from '../../models/incident-type.model';
import { IncidentTypeFormComponent } from '../../components/incident-type-form/incident-type-form.component';
import { IncidentTabsComponent } from '../../components/incident-tabs/incident-tabs.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-incident-type-list',
  standalone: true,
  imports: [IncidentTypeFormComponent, IncidentTabsComponent, PaginationComponent, ConfirmDialogComponent],
  templateUrl: './incident-type-list.page.html',
})
export class IncidentTypeListPage implements OnInit {
  private readonly incidentTypeService = inject(IncidentTypeService);
  private readonly toast = inject(ToastService);

  readonly types = signal<IncidentType[]>([]);
  readonly loading = signal(false);
  readonly pageNumber = signal(1);
  readonly pageSize = signal(20);
  readonly totalCount = signal(0);
  readonly totalPages = signal(0);

  readonly targetLabels = ASSIGNMENT_TARGET_LABELS;

  private typeToDelete: IncidentType | null = null;

  readonly typeForm = viewChild.required(IncidentTypeFormComponent);
  readonly confirmDialog = viewChild.required(ConfirmDialogComponent);

  ngOnInit(): void {
    this.loadTypes();
  }

  loadTypes(): void {
    this.loading.set(true);
    this.incidentTypeService.getAll(this.pageNumber(), this.pageSize()).subscribe({
      next: (res) => {
        this.types.set(res.items);
        this.totalCount.set(res.totalCount);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Error al cargar los tipos de incidentes');
        this.loading.set(false);
      },
    });
  }

  onPageChange(page: number): void {
    this.pageNumber.set(page);
    this.loadTypes();
  }

  onCreate(): void {
    this.typeForm().openCreate();
  }

  onEdit(type: IncidentType): void {
    this.typeForm().openEdit(type);
  }

  onDeleteRequest(type: IncidentType): void {
    this.typeToDelete = type;
    this.confirmDialog().open();
  }

  onDeleteConfirmed(): void {
    if (!this.typeToDelete) return;
    const id = this.typeToDelete.id;
    this.typeToDelete = null;

    this.incidentTypeService.delete(id).subscribe({
      next: () => {
        this.toast.success('Tipo eliminado');
        this.loadTypes();
      },
      error: (err) => {
        this.toast.error(err.error?.message ?? 'Error al eliminar el tipo');
      },
    });
  }

  onFormSaved(): void {
    this.loadTypes();
  }
}
