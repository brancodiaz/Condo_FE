import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ImportantContactService } from '../../services/important-contact.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { ImportantContact } from '../../models/important-contact.model';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-pending-contacts',
  standalone: true,
  imports: [PaginationComponent, RouterLink, DatePipe],
  templateUrl: './pending-contacts.page.html',
})
export class PendingContactsPage implements OnInit {
  private readonly contactService = inject(ImportantContactService);
  private readonly toast = inject(ToastService);

  readonly contacts = signal<ImportantContact[]>([]);
  readonly loading = signal(false);
  readonly pageNumber = signal(1);
  readonly pageSize = signal(20);
  readonly totalCount = signal(0);
  readonly totalPages = signal(0);

  ngOnInit(): void {
    this.loadPending();
  }

  loadPending(): void {
    this.loading.set(true);
    this.contactService.getPending(this.pageNumber(), this.pageSize()).subscribe({
      next: (res) => {
        this.contacts.set(res.items);
        this.totalCount.set(res.totalCount);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Error al cargar los contactos pendientes');
        this.loading.set(false);
      },
    });
  }

  onPageChange(page: number): void {
    this.pageNumber.set(page);
    this.loadPending();
  }

  onApprove(contact: ImportantContact): void {
    this.contactService.approve(contact.id).subscribe({
      next: () => {
        this.toast.success(`Contacto "${contact.name}" aprobado`);
        this.loadPending();
      },
      error: (err) => {
        this.toast.error(err.error?.message ?? 'Error al aprobar el contacto');
      },
    });
  }

  onReject(contact: ImportantContact): void {
    this.contactService.reject(contact.id).subscribe({
      next: () => {
        this.toast.success(`Contacto "${contact.name}" rechazado`);
        this.loadPending();
      },
      error: (err) => {
        this.toast.error(err.error?.message ?? 'Error al rechazar el contacto');
      },
    });
  }
}
