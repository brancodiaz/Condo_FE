export interface Announcement {
  id: string;
  title: string;
  content: string;
  scope: string;
  blockId?: string;
  blockName?: string;
  authorId: number;
  authorName: string;
  createdAt: string;
}

export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  scope: string;
  blockId?: string | null;
}

export interface UpdateAnnouncementRequest extends CreateAnnouncementRequest {}

export const SCOPE_LABELS: Record<string, string> = {
  CONDOMINIUM: 'Todo el condominio',
  BLOCK: 'Bloque',
};
