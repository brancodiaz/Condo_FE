export interface Condominium {
  id: number;
  name: string;
  address: string;
  imageUrl: string | null;
}

/** Returned by GET /condominiums?view=details — includes user role */
export interface CondominiumDetailed {
  condominiumId: string;
  createdAt: string;
  name: string;
  address: string;
  country: string;
  totalUnits: number;
  planId: string;
  subscriptionExpiresAt: string | null;
  roleId: string;
  roleName: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
