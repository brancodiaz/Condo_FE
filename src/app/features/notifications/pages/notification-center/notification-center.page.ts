import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NotificationService } from '../../../../core/services/notification.service';
import { AppNotification } from '../../models/notification.model';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [DatePipe, PaginationComponent],
  template: `
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-base-content">Notificaciones</h1>
          <p class="text-base-content/50 mt-1">Todas tus notificaciones</p>
        </div>
        @if (notificationService.unreadCount() > 0) {
          <button class="btn btn-primary btn-sm gap-2" (click)="onMarkAllAsRead()">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Marcar todas como leidas
          </button>
        }
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="space-y-3">
          @for (i of [1, 2, 3, 4, 5]; track i) {
            <div class="card bg-base-100 border border-base-300 shadow-sm">
              <div class="card-body p-4">
                <div class="skeleton h-4 w-48"></div>
                <div class="skeleton h-3 w-full mt-2"></div>
                <div class="skeleton h-3 w-24 mt-1"></div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Empty state -->
      @else if (notifications().length === 0) {
        <div class="card bg-base-100 border border-base-300 shadow-sm">
          <div class="card-body items-center text-center py-16">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-base-content/15 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <h3 class="text-lg font-semibold text-base-content/60">No tienes notificaciones</h3>
            <p class="text-base-content/40 text-sm mt-1 max-w-sm">
              Las notificaciones apareceran aqui cuando haya actividad relevante en tu condominio.
            </p>
          </div>
        </div>
      }

      <!-- Notifications list -->
      @else {
        <div class="space-y-2">
          @for (notification of notifications(); track notification.id) {
            <div
              class="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              [class.border-l-4]="!notification.isRead"
              [class.border-l-primary]="!notification.isRead"
              (click)="onNotificationClick(notification)"
            >
              <div class="card-body p-4">
                <div class="flex items-start justify-between gap-4">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <h3 class="text-sm font-semibold truncate" [class.font-bold]="!notification.isRead">
                        {{ notification.title }}
                      </h3>
                      @if (!notification.isRead) {
                        <div class="w-2 h-2 rounded-full bg-primary flex-shrink-0"></div>
                      }
                    </div>
                    <p class="text-sm text-base-content/60 mt-1">{{ notification.message }}</p>
                    <p class="text-xs text-base-content/30 mt-2">{{ notification.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
                  </div>
                  <button
                    class="btn btn-ghost btn-xs btn-square text-error flex-shrink-0"
                    title="Eliminar"
                    (click)="onDelete($event, notification)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          }
        </div>

        <div class="mt-4">
          <app-pagination
            [pageNumber]="pageNumber()"
            [pageSize]="pageSize()"
            [totalCount]="totalCount()"
            [totalPages]="totalPages()"
            (pageChange)="onPageChange($event)"
          />
        </div>
      }
    </div>
  `,
})
export class NotificationCenterPage implements OnInit {
  readonly notificationService = inject(NotificationService);

  readonly notifications = signal<AppNotification[]>([]);
  readonly loading = signal(false);
  readonly pageNumber = signal(1);
  readonly pageSize = signal(20);
  readonly totalCount = signal(0);
  readonly totalPages = signal(0);

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading.set(true);
    this.notificationService.getAll(this.pageNumber(), this.pageSize()).subscribe({
      next: (res) => {
        this.notifications.set(res.items as AppNotification[]);
        this.totalCount.set(res.totalCount);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  onPageChange(page: number): void {
    this.pageNumber.set(page);
    this.loadNotifications();
  }

  onMarkAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notificationService.unreadCount.set(0);
        const updated = this.notifications().map(n => ({ ...n, isRead: true }));
        this.notifications.set(updated);
      },
    });
  }

  onNotificationClick(notification: AppNotification): void {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id).subscribe({
        next: () => {
          const count = this.notificationService.unreadCount();
          if (count > 0) this.notificationService.unreadCount.set(count - 1);
          const updated = this.notifications().map(n =>
            n.id === notification.id ? { ...n, isRead: true } : n
          );
          this.notifications.set(updated);
        },
      });
    }
  }

  onDelete(event: Event, notification: AppNotification): void {
    event.stopPropagation();
    this.notificationService.delete(notification.id).subscribe({
      next: () => {
        this.notifications.set(this.notifications().filter(n => n.id !== notification.id));
        this.totalCount.set(this.totalCount() - 1);
        if (!notification.isRead) {
          const count = this.notificationService.unreadCount();
          if (count > 0) this.notificationService.unreadCount.set(count - 1);
        }
      },
    });
  }
}
