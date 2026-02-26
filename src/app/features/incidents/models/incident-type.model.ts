export interface IncidentType {
  id: number;
  name: string;
  description?: string;
  assignmentTarget: string;
  allowPublicVisibility: boolean;
  createdAt: string;
}

export interface CreateIncidentTypeRequest {
  name: string;
  description?: string | null;
  assignmentTarget: string;
  allowPublicVisibility: boolean;
}

export interface UpdateIncidentTypeRequest extends CreateIncidentTypeRequest {}

export const ASSIGNMENT_TARGET_LABELS: Record<string, string> = {
  CONDO_ADMIN: 'Administrador del condominio',
  BLOCK_ADMIN: 'Administrador del bloque',
  BOARD: 'Junta directiva',
};
