export interface Incident {
  id: string;
  incidentTypeId: number;
  incidentTypeName: string;
  title: string;
  description: string;
  reportedById: number;
  reportedByName: string;
  assignedToId?: number | null;
  assignedToName?: string | null;
  blockId?: string | null;
  blockName?: string | null;
  status: string;
  isPublic: boolean;
  createdAt: string;
}

export interface CreateIncidentRequest {
  incidentTypeId: number;
  title: string;
  description: string;
  blockId?: string | null;
  isPublic: boolean;
}

export interface UpdateIncidentRequest {
  title: string;
  description: string;
  blockId?: string | null;
  isPublic: boolean;
}

export interface IncidentInteraction {
  id: string;
  incidentId: string;
  userId: number;
  userName: string;
  comment?: string | null;
  oldStatus?: string | null;
  newStatus?: string | null;
  createdAt: string;
}

export const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Abierto',
  IN_REVIEW: 'En revision',
  IN_PROGRESS: 'En progreso',
  RESOLVED: 'Resuelto',
  CLOSED: 'Cerrado',
};

export const STATUS_BADGE_CLASS: Record<string, string> = {
  OPEN: 'badge-error',
  IN_REVIEW: 'badge-warning',
  IN_PROGRESS: 'badge-info',
  RESOLVED: 'badge-success',
  CLOSED: 'badge-neutral',
};

export const VALID_TRANSITIONS: Record<string, string[]> = {
  OPEN: ['IN_REVIEW'],
  IN_REVIEW: ['IN_PROGRESS', 'OPEN'],
  IN_PROGRESS: ['RESOLVED'],
  RESOLVED: ['CLOSED', 'OPEN'],
  CLOSED: ['OPEN'],
};
