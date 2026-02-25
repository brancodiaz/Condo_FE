export interface Block {
  id: string;
  name: string;
  totalUnits: number;
  createdAt: string;
}

export interface CreateBlockRequest {
  name: string;
  description: string;
}

export interface UpdateBlockRequest {
  name: string;
  description: string;
}
