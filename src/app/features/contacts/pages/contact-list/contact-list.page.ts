import { Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ImportantContactService } from '../../services/important-contact.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { ImportantContact, STATUS_LABELS, STATUS_BADGE_CLASS } from '../../models/important-contact.model';
import { ContactFormComponent } from '../../components/contact-form/contact-form.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [ContactFormComponent, PaginationComponent, ConfirmDialogComponent, RouterLink],
  templateUrl: './contact-list.page.html',
})
export class ContactListPage implements OnInit {
  private readonly contactService = inject(ImportantContactService);
  private readonly toast = inject(ToastService);

  readonly contacts = signal<ImportantContact[]>([]);
  readonly loading = signal(false);
  readonly pageNumber = signal(1);
  readonly pageSize = signal(20);
  readonly totalCount = signal(0);
  readonly totalPages = signal(0);
  readonly pendingCount = signal(0);

  private contactToDelete: ImportantContact | null = null;

  readonly contactForm = viewChild.required(ContactFormComponent);
  readonly confirmDialog = viewChild.required(ConfirmDialogComponent);

  ngOnInit(): void {
    this.loadContacts();
    this.loadPendingCount();
  }

  loadContacts(): void {
    this.loading.set(true);
    this.contactService.getAll(this.pageNumber(), this.pageSize()).subscribe({
      next: (res) => {
        this.contacts.set(res.items);
        this.totalCount.set(res.totalCount);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Error al cargar los contactos');
        this.loading.set(false);
      },
    });
  }

  private loadPendingCount(): void {
    this.contactService.getPending(1, 1).subscribe({
      next: (res) => this.pendingCount.set(res.totalCount),
    });
  }

  getStatusLabel(status: string): string {
    return STATUS_LABELS[status] ?? status;
  }

  getStatusBadgeClass(status: string): string {
    return STATUS_BADGE_CLASS[status] ?? 'badge-ghost';
  }

  onPageChange(page: number): void {
    this.pageNumber.set(page);
    this.loadContacts();
  }

  onCreate(): void {
    this.contactForm().openCreate();
  }

  onEdit(contact: ImportantContact): void {
    this.contactForm().openEdit(contact);
  }

  onDeleteRequest(contact: ImportantContact): void {
    this.contactToDelete = contact;
    this.confirmDialog().open();
  }

  onDeleteConfirmed(): void {
    if (!this.contactToDelete) return;
    const id = this.contactToDelete.id;
    this.contactToDelete = null;

    this.contactService.delete(id).subscribe({
      next: () => {
        this.toast.success('Contacto eliminado');
        this.loadContacts();
      },
      error: (err) => {
        this.toast.error(err.error?.message ?? 'Error al eliminar el contacto');
      },
    });
  }

  onFormSaved(): void {
    this.loadContacts();
    this.loadPendingCount();
  }
}
