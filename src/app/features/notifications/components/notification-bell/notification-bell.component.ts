import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { NotificationService } from '../../../../core/services/notification.service';
import { CondoContextService } from '../../../../core/services/condo-context.service';
import { AppNotification, getNotificationRoute } from '../../models/notification.model';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="dropdown dropdown-end">
      <div tabindex="0" role="button" class="btn btn-ghost btn-sm btn-square" aria-label="Notificaciones">
        <div class="indicator">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          @if (notificationService.unreadCount() > 0) {
            <span class="badge badge-primary badge-xs indicator-item">{{ notificationService.unreadCount() > 99 ? '99+' : notificationService.unreadCount() }}</span>
          }
        </div>
      </div>
      <div tabindex="0" class="dropdown-content z-50 bg-base-100 rounded-box shadow-lg border border-base-300 w-[calc(100vw-2rem)] sm:w-80 right-0 mt-1">
        <div class="p-3 border-b border-base-300 flex items-center justify-between">
          <span class="font-semibold text-sm">Notificaciones</span>
          @if (notificationService.unreadCount() > 0) {
            <button class="btn btn-ghost btn-xs" (click)="onMarkAllAsRead()">Marcar todas leidas</button>
          }
        </div>
        <div class="max-h-80 overflow-y-auto">
          @if (notificationService.recentNotifications().length === 0) {
            <div class="p-6 text-center text-base-content/40 text-sm">
              Sin notificaciones
            </div>
          } @else {
            @for (notification of notificationService.recentNotifications(); track notification.id) {
              <div
                class="p-3 hover:bg-base-200/50 cursor-pointer border-b border-base-300 last:border-b-0"
                [class.bg-primary/5]="!notification.isRead"
                (click)="onNotificationClick(notification)"
              >
                <div class="flex items-start gap-2">
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium truncate" [class.font-bold]="!notification.isRead">{{ notification.title }}</p>
                    <p class="text-xs text-base-content/50 line-clamp-2 mt-0.5">{{ notification.message }}</p>
                    <p class="text-xs text-base-content/30 mt-1">{{ notification.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
                  </div>
                  @if (!notification.isRead) {
                    <div class="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                  }
                </div>
              </div>
            }
          }
        </div>
        <div class="p-2 border-t border-base-300">
          <button class="btn btn-ghost btn-sm btn-block text-primary" (click)="onViewAll()">Ver todas</button>
        </div>
      </div>
    </div>
  `,
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  readonly notificationService = inject(NotificationService);
  private readonly condoContext = inject(CondoContextService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.notificationService.startPolling();
  }

  ngOnDestroy(): void {
    this.notificationService.stopPolling();
  }

  onMarkAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notificationService.unreadCount.set(0);
        const updated = this.notificationService.recentNotifications().map(n => ({ ...n, isRead: true }));
        this.notificationService.recentNotifications.set(updated);
      },
    });
  }

  onNotificationClick(notification: AppNotification): void {
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id).subscribe({
        next: () => {
          const count = this.notificationService.unreadCount();
          if (count > 0) this.notificationService.unreadCount.set(count - 1);
          const updated = this.notificationService.recentNotifications().map(n =>
            n.id === notification.id ? { ...n, isRead: true } : n
          );
          this.notificationService.recentNotifications.set(updated);
        },
      });
    }

    // Close dropdown by blurring
    (document.activeElement as HTMLElement)?.blur();

    // Navigate to the referenced entity
    const condoId = this.condoContext.currentCondoId();
    if (condoId) {
      const route = getNotificationRoute(notification, condoId);
      if (route) this.router.navigate(route);
    }
  }

  onViewAll(): void {
    const condoId = this.condoContext.currentCondoId();
    if (condoId) {
      this.router.navigate(['/condos', condoId, 'notifications']);
    }
    (document.activeElement as HTMLElement)?.blur();
  }
}
