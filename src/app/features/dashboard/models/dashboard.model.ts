export interface AdminStats {
  totalUnits: number;
  totalBlocks: number;
  totalMembers: number;
  pendingPayments: number;
  openIncidents: number;
}

export interface OwnerStats {
  pendingPayments: number;
  reservations: number;
  announcements: number;
}

export interface TenantStats {
  pendingPayments: number;
  announcements: number;
}

export type DashboardStats = AdminStats | OwnerStats | TenantStats;
