import { inject, Injectable, signal, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PaginatedResponse } from '../../features/condos/models/condominium.model';
import { AppNotification } from '../../features/notifications/models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService implements OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/notifications`;
  private pollingInterval: ReturnType<typeof setInterval> | null = null;

  readonly unreadCount = signal(0);
  readonly recentNotifications = signal<AppNotification[]>([]);

  getAll(pageNumber = 1, pageSize = 20): Observable<PaginatedResponse<AppNotification>> {
    return this.http.get<PaginatedResponse<AppNotification>>(this.apiUrl, {
      params: { pageNumber, pageSize },
    });
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/unread-count`);
  }

  markAsRead(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/read`, {});
  }

  markAllAsRead(): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/read-all`, {});
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  startPolling(): void {
    this.stopPolling();
    this.refreshUnreadCount();
    this.refreshRecent();
    this.pollingInterval = setInterval(() => {
      this.refreshUnreadCount();
    }, 30_000);
  }

  stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.unreadCount.set(0);
    this.recentNotifications.set([]);
  }

  refreshUnreadCount(): void {
    this.getUnreadCount().subscribe({
      next: (res) => this.unreadCount.set(res.count),
    });
  }

  refreshRecent(): void {
    this.getAll(1, 5).subscribe({
      next: (res) => this.recentNotifications.set(res.items as AppNotification[]),
    });
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }
}
