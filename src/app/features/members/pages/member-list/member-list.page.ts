import { Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MemberService } from '../../services/member.service';
import { ToastService } from '../../../../shared/services/toast.service';
import {
  MemberResponse,
  PendingInvitationResponse,
  ROLE_LABELS,
  STATUS_LABELS,
  STATUS_BADGE_CLASS,
} from '../../models/member.model';
import { InviteFormComponent } from '../../components/invite-form/invite-form.component';
import { ManualRegisterFormComponent } from '../../components/manual-register-form/manual-register-form.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [DatePipe, InviteFormComponent, ManualRegisterFormComponent, PaginationComponent, ConfirmDialogComponent],
  templateUrl: './member-list.page.html',
})
export class MemberListPage implements OnInit {
  private readonly memberService = inject(MemberService);
  private readonly toast = inject(ToastService);

  readonly members = signal<MemberResponse[]>([]);
  readonly invitations = signal<PendingInvitationResponse[]>([]);
  readonly loading = signal(false);
  readonly pageNumber = signal(1);
  readonly pageSize = signal(20);
  readonly totalCount = signal(0);
  readonly totalPages = signal(0);

  private memberToRemove: MemberResponse | null = null;

  readonly inviteForm = viewChild.required(InviteFormComponent);
  readonly manualRegisterForm = viewChild.required(ManualRegisterFormComponent);
  readonly confirmDialog = viewChild.required(ConfirmDialogComponent);

  ngOnInit(): void {
    this.loadMembers();
    this.loadInvitations();
  }

  loadMembers(): void {
    this.loading.set(true);
    this.memberService.getMembers(this.pageNumber(), this.pageSize()).subscribe({
      next: (res) => {
        this.members.set(res.items);
        this.totalCount.set(res.totalCount);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Error al cargar los miembros');
        this.loading.set(false);
      },
    });
  }

  loadInvitations(): void {
    this.memberService.getPendingInvitations().subscribe({
      next: (res) => this.invitations.set(res),
      error: () => this.toast.error('Error al cargar las invitaciones'),
    });
  }

  getRoleLabel(roleId: string): string {
    return ROLE_LABELS[roleId] ?? roleId;
  }

  getStatusLabel(status: string): string {
    return STATUS_LABELS[status] ?? status;
  }

  getStatusBadgeClass(status: string): string {
    return STATUS_BADGE_CLASS[status] ?? 'badge-ghost';
  }

  onPageChange(page: number): void {
    this.pageNumber.set(page);
    this.loadMembers();
  }

  onInvite(): void {
    this.inviteForm().open();
  }

  onManualRegister(): void {
    this.manualRegisterForm().open();
  }

  onRemoveRequest(member: MemberResponse): void {
    this.memberToRemove = member;
    this.confirmDialog().open();
  }

  onRemoveConfirmed(): void {
    if (!this.memberToRemove) return;
    const userId = this.memberToRemove.userId;
    this.memberToRemove = null;

    this.memberService.removeMember(userId).subscribe({
      next: () => {
        this.toast.success('Miembro eliminado del condominio');
        this.loadMembers();
      },
      error: (err) => {
        this.toast.error(err.error?.message ?? 'Error al eliminar el miembro');
      },
    });
  }

  onResendInvitation(invitation: PendingInvitationResponse): void {
    this.memberService.resendInvitation(invitation.id).subscribe({
      next: () => {
        this.toast.success('Invitacion reenviada');
        this.loadInvitations();
      },
      error: (err) => {
        this.toast.error(err.error?.message ?? 'Error al reenviar la invitacion');
      },
    });
  }

  onCancelInvitation(invitation: PendingInvitationResponse): void {
    this.memberService.cancelInvitation(invitation.id).subscribe({
      next: () => {
        this.toast.success('Invitacion cancelada');
        this.loadInvitations();
      },
      error: (err) => {
        this.toast.error(err.error?.message ?? 'Error al cancelar la invitacion');
      },
    });
  }

  onFormSaved(): void {
    this.loadMembers();
    this.loadInvitations();
  }
}
