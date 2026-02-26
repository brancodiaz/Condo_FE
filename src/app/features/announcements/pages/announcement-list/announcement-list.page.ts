import { Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AnnouncementService } from '../../services/announcement.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { Announcement, SCOPE_LABELS } from '../../models/announcement.model';
import { AnnouncementFormComponent } from '../../components/announcement-form/announcement-form.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-announcement-list',
  standalone: true,
  imports: [DatePipe, AnnouncementFormComponent, PaginationComponent, ConfirmDialogComponent],
  templateUrl: './announcement-list.page.html',
})
export class AnnouncementListPage implements OnInit {
  private readonly announcementService = inject(AnnouncementService);
  private readonly toast = inject(ToastService);

  readonly announcements = signal<Announcement[]>([]);
  readonly loading = signal(false);
  readonly pageNumber = signal(1);
  readonly pageSize = signal(20);
  readonly totalCount = signal(0);
  readonly totalPages = signal(0);

  private announcementToDelete: Announcement | null = null;

  readonly announcementForm = viewChild.required(AnnouncementFormComponent);
  readonly confirmDialog = viewChild.required(ConfirmDialogComponent);

  ngOnInit(): void {
    this.loadAnnouncements();
  }

  loadAnnouncements(): void {
    this.loading.set(true);
    this.announcementService.getAll(this.pageNumber(), this.pageSize()).subscribe({
      next: (res) => {
        this.announcements.set(res.items);
        this.totalCount.set(res.totalCount);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Error al cargar los anuncios');
        this.loading.set(false);
      },
    });
  }

  getScopeLabel(scope: string): string {
    return SCOPE_LABELS[scope] ?? scope;
  }

  onPageChange(page: number): void {
    this.pageNumber.set(page);
    this.loadAnnouncements();
  }

  onCreate(): void {
    this.announcementForm().openCreate();
  }

  onEdit(announcement: Announcement): void {
    this.announcementForm().openEdit(announcement);
  }

  onDeleteRequest(announcement: Announcement): void {
    this.announcementToDelete = announcement;
    this.confirmDialog().open();
  }

  onDeleteConfirmed(): void {
    if (!this.announcementToDelete) return;
    const id = this.announcementToDelete.id;
    this.announcementToDelete = null;

    this.announcementService.delete(id).subscribe({
      next: () => {
        this.toast.success('Anuncio eliminado');
        this.loadAnnouncements();
      },
      error: (err) => {
        this.toast.error(err.error?.message ?? 'Error al eliminar el anuncio');
      },
    });
  }

  onFormSaved(): void {
    this.loadAnnouncements();
  }
}
