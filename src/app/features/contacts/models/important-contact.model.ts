export interface ImportantContact {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  description?: string;
  contactTypeName: string;
  blockId?: string;
  blockName?: string;
  status: string;
  createdByUserName: string;
  createdByUserId: number;
  approvedByUserName?: string;
  approvedAt?: string;
  createdAt: string;
}

export interface CreateImportantContactRequest {
  name: string;
  phoneNumber: string;
  email?: string | null;
  description?: string | null;
  contactTypeName: string;
  blockId?: string | null;
}

export interface UpdateImportantContactRequest extends CreateImportantContactRequest {}

export const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
};

export const STATUS_BADGE_CLASS: Record<string, string> = {
  PENDING: 'badge-warning',
  APPROVED: 'badge-success',
  REJECTED: 'badge-error',
};
