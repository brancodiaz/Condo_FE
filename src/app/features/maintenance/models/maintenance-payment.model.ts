export interface MaintenancePayment {
  id: string;
  maintenanceFeeId: string;
  maintenanceFeeName: string;
  unitId: number;
  unitName?: string;
  paidByUserId: number;
  paidByName?: string;
  amount: number;
  periodsCovered: number;
  periodStart: string;
  periodEnd: string;
  paymentDate: string;
  status: string;
  notes?: string;
  receiptFileName?: string;
  hasReceipt: boolean;
  reviewedByUserId?: number;
  reviewedByName?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface CreateMaintenancePaymentRequest {
  maintenanceFeeId: string;
  unitId: number;
  amount: number;
  periodsCovered: number;
  periodStart: string;
  periodEnd: string;
  paymentDate: string;
  notes?: string;
}

export interface RejectPaymentRequest {
  rejectionReason: string;
}

export const PAYMENT_STATUS: Record<string, { label: string; badge: string }> = {
  PENDING: { label: 'Pendiente', badge: 'badge-warning' },
  APPROVED: { label: 'Aprobado', badge: 'badge-success' },
  REJECTED: { label: 'Rechazado', badge: 'badge-error' },
};
