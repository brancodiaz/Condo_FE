export interface MemberResponse {
  userId: number;
  fullName: string;
  email: string;
  roleId: string;
  roleName: string;
  status: string;
  joinedAt: string;
}

export interface PendingInvitationResponse {
  id: number;
  email: string;
  roleId: string;
  roleName: string;
  invitedByName: string;
  createdAt: string;
  expiresAt: string;
}

export interface InviteMemberRequest {
  email: string;
  roleId: string;
}

export interface ManualRegisterMemberRequest {
  firstName: string;
  lastName: string;
  email: string;
  roleId: string;
}

export interface InviteMemberResponse {
  isExistingUser: boolean;
  message: string;
}

export interface ValidateInvitationResponse {
  email: string;
  condominiumName: string;
  roleId: string;
  roleName: string;
  isExistingUser: boolean;
}

export interface AcceptInvitationRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  token: string;
}

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  OWNER: 'Propietario',
  TENANT: 'Inquilino',
  PRESIDENT: 'Presidente',
  SECRETARY: 'Secretario',
  TREASURER: 'Tesorero',
  RELATIVE: 'Familiar',
};

export const ASSIGNABLE_ROLES = [
  { id: 'ADMIN', label: 'Administrador' },
  { id: 'OWNER', label: 'Propietario' },
  { id: 'TENANT', label: 'Inquilino' },
  { id: 'PRESIDENT', label: 'Presidente' },
  { id: 'SECRETARY', label: 'Secretario' },
  { id: 'TREASURER', label: 'Tesorero' },
  { id: 'RELATIVE', label: 'Familiar' },
];

export const STATUS_LABELS: Record<string, string> = {
  Active: 'Activo',
  Inactive: 'Pendiente',
};

export const STATUS_BADGE_CLASS: Record<string, string> = {
  Active: 'badge-success',
  Inactive: 'badge-warning',
};
