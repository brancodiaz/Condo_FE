export interface CommonArea {
  id: string;
  name: string;
  description?: string;
  blockId?: string;
  blockName?: string;
  capacity?: number;
  hasCost: boolean;
  costAmount?: number;
  currency?: string;
  rules?: string;
  createdAt: string;
}

export interface CreateCommonAreaRequest {
  name: string;
  description?: string | null;
  blockId?: string | null;
  capacity?: number | null;
  hasCost: boolean;
  costAmount?: number | null;
  currency?: string | null;
  rules?: string | null;
}

export interface UpdateCommonAreaRequest extends CreateCommonAreaRequest {}
