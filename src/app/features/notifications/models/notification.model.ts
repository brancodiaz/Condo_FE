export interface AppNotification {
  id: string;
  userId: number;
  title: string;
  message: string;
  type: string;
  referenceId?: string;
  referenceType?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export function getNotificationRoute(notification: AppNotification, condoId: string): string[] | null {
  if (!notification.referenceType || !notification.referenceId) return null;
  const base = ['/condos', condoId];
  switch (notification.referenceType) {
    case 'Announcement':       return [...base, 'announcements'];
    case 'MaintenancePayment': return [...base, 'maintenance', 'payments'];
    case 'Incident':           return [...base, 'incidents', notification.referenceId];
    case 'Reservation':        return [...base, 'common-areas', 'reservations'];
    default:                   return null;
  }
}

export const NOTIFICATION_TYPE_CONFIG: Record<string, { icon: string; color: string }> = {
  PaymentApproved: { icon: 'check-circle', color: 'text-success' },
  PaymentRejected: { icon: 'x-circle', color: 'text-error' },
  Announcement: { icon: 'megaphone', color: 'text-info' },
  IncidentUpdated: { icon: 'exclamation-triangle', color: 'text-warning' },
  ReservationStatus: { icon: 'calendar', color: 'text-primary' },
  System: { icon: 'bell', color: 'text-base-content' },
};
