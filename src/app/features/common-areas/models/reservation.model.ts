export interface Reservation {
  id: string;
  commonAreaId: string;
  commonAreaName: string;
  reservedByUserId: number;
  reservedByUserName: string;
  reservationDate: string;
  startTime: string;
  endTime: string;
  status: string;
  costAmount?: number;
  notes?: string;
  rejectionReason?: string;
  reviewedByUserName?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface CreateReservationRequest {
  commonAreaId: string;
  reservationDate: string;
  startTime: string;
  endTime: string;
  notes?: string | null;
}

export interface RejectReservationRequest {
  rejectionReason: string;
}

export interface AvailabilityResponse {
  commonAreaId: string;
  date: string;
  existingReservations: Reservation[];
}

export const RESERVATION_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  APPROVED: 'Aprobada',
  REJECTED: 'Rechazada',
  CANCELLED: 'Cancelada',
};

export const RESERVATION_STATUS_BADGE: Record<string, string> = {
  PENDING: 'badge-warning',
  APPROVED: 'badge-success',
  REJECTED: 'badge-error',
  CANCELLED: 'badge-ghost',
};
