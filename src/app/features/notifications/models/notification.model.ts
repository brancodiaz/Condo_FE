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

export const NOTIFICATION_TYPE_CONFIG: Record<string, { icon: string; color: string }> = {
  PaymentApproved: { icon: 'check-circle', color: 'text-success' },
  PaymentRejected: { icon: 'x-circle', color: 'text-error' },
  Announcement: { icon: 'megaphone', color: 'text-info' },
  IncidentUpdated: { icon: 'exclamation-triangle', color: 'text-warning' },
  ReservationStatus: { icon: 'calendar', color: 'text-primary' },
  System: { icon: 'bell', color: 'text-base-content' },
};
