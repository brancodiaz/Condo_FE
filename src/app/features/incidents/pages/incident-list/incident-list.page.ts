import { Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { IncidentService } from '../../services/incident.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { CondoContextService } from '../../../../core/services/condo-context.service';
import { Incident, STATUS_LABELS, STATUS_BADGE_CLASS } from '../../models/incident.model';
import { IncidentFormComponent } from '../../components/incident-form/incident-form.component';
import { IncidentTabsComponent } from '../../components/incident-tabs/incident-tabs.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-incident-list',
  standalone: true,
  imports: [IncidentFormComponent, IncidentTabsComponent, PaginationComponent, ConfirmDialogComponent, DatePipe],
  templateUrl: './incident-list.page.html',
})
export class IncidentListPage implements OnInit {
  private readonly incidentService = inject(IncidentService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly condoContext = inject(CondoContextService);

  readonly incidents = signal<Incident[]>([]);
  readonly loading = signal(false);
  readonly pageNumber = signal(1);
  readonly pageSize = signal(20);
  readonly totalCount = signal(0);
  readonly totalPages = signal(0);

  readonly statusLabels = STATUS_LABELS;
  readonly statusBadgeClass = STATUS_BADGE_CLASS;

  private incidentToDelete: Incident | null = null;

  readonly incidentForm = viewChild.required(IncidentFormComponent);
  readonly confirmDialog = viewChild.required(ConfirmDialogComponent);

  ngOnInit(): void {
    this.loadIncidents();
  }

  loadIncidents(): void {
    this.loading.set(true);
    this.incidentService.getAll(this.pageNumber(), this.pageSize()).subscribe({
      next: (res) => {
        this.incidents.set(res.items);
        this.totalCount.set(res.totalCount);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Error al cargar los incidentes');
        this.loading.set(false);
      },
    });
  }

  onPageChange(page: number): void {
    this.pageNumber.set(page);
    this.loadIncidents();
  }

  onCreate(): void {
    this.incidentForm().openCreate();
  }

  onEdit(incident: Incident): void {
    this.incidentForm().openEdit(incident);
  }

  onView(incident: Incident): void {
    const condoId = this.condoContext.currentCondoId();
    this.router.navigate(['/condos', condoId, 'incidents', incident.id]);
  }

  onDeleteRequest(incident: Incident): void {
    this.incidentToDelete = incident;
    this.confirmDialog().open();
  }

  onDeleteConfirmed(): void {
    if (!this.incidentToDelete) return;
    const id = this.incidentToDelete.id;
    this.incidentToDelete = null;

    this.incidentService.delete(id).subscribe({
      next: () => {
        this.toast.success('Incidente eliminado');
        this.loadIncidents();
      },
      error: (err) => {
        this.toast.error(err.error?.message ?? 'Error al eliminar el incidente');
      },
    });
  }

  onFormSaved(): void {
    this.loadIncidents();
  }
}
