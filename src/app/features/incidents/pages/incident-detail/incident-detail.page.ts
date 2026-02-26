import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IncidentService } from '../../services/incident.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { CondoContextService } from '../../../../core/services/condo-context.service';
import {
  Incident,
  IncidentInteraction,
  STATUS_LABELS,
  STATUS_BADGE_CLASS,
  VALID_TRANSITIONS,
} from '../../models/incident.model';

@Component({
  selector: 'app-incident-detail',
  standalone: true,
  imports: [DatePipe, FormsModule],
  templateUrl: './incident-detail.page.html',
})
export class IncidentDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly incidentService = inject(IncidentService);
  private readonly toast = inject(ToastService);
  private readonly condoContext = inject(CondoContextService);

  readonly incident = signal<Incident | null>(null);
  readonly interactions = signal<IncidentInteraction[]>([]);
  readonly loading = signal(true);
  readonly statusLoading = signal(false);
  readonly commentLoading = signal(false);

  readonly statusLabels = STATUS_LABELS;
  readonly statusBadgeClass = STATUS_BADGE_CLASS;

  newComment = '';
  assignUserId: number | null = null;

  private incidentId = '';

  ngOnInit(): void {
    this.incidentId = this.route.snapshot.paramMap.get('incidentId') ?? '';
    this.loadIncident();
    this.loadInteractions();
  }

  loadIncident(): void {
    this.loading.set(true);
    this.incidentService.getById(this.incidentId).subscribe({
      next: (inc) => {
        this.incident.set(inc);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Error al cargar el incidente');
        this.loading.set(false);
      },
    });
  }

  loadInteractions(): void {
    this.incidentService.getInteractions(this.incidentId).subscribe({
      next: (items) => this.interactions.set(items),
    });
  }

  getValidTransitions(): string[] {
    const status = this.incident()?.status;
    if (!status) return [];
    return VALID_TRANSITIONS[status] ?? [];
  }

  changeStatus(newStatus: string): void {
    this.statusLoading.set(true);
    this.incidentService.changeStatus(this.incidentId, newStatus).subscribe({
      next: () => {
        this.toast.success('Estado actualizado');
        this.statusLoading.set(false);
        this.loadIncident();
        this.loadInteractions();
      },
      error: (err) => {
        this.toast.error(err.error?.message ?? 'Error al cambiar el estado');
        this.statusLoading.set(false);
      },
    });
  }

  addComment(): void {
    if (!this.newComment.trim()) return;
    this.commentLoading.set(true);
    this.incidentService.addComment(this.incidentId, this.newComment.trim()).subscribe({
      next: () => {
        this.toast.success('Comentario agregado');
        this.newComment = '';
        this.commentLoading.set(false);
        this.loadInteractions();
      },
      error: (err) => {
        this.toast.error(err.error?.message ?? 'Error al agregar comentario');
        this.commentLoading.set(false);
      },
    });
  }

  goBack(): void {
    const condoId = this.condoContext.currentCondoId();
    this.router.navigate(['/condos', condoId, 'incidents', 'list']);
  }
}
