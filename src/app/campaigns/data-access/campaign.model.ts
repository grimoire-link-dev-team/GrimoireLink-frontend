
export interface Campaign {
  publicId: string;
  name: string;
  description: string;
  inviteCode: number | null;
  status: 'ACTIVE' | 'PAUSED' | 'FINISHED';
}

export interface CampaignRequest {
  name: string;
  description: string;
}

export interface CampaignMember {
  publicId: string;
  name: string;
  email: string;
  joinDate: string;
  role: 'PLAYER' | 'DUNGEON_MASTER';
}

export const CAMPAIGN_STATUS_LABELS: Record<Campaign['status'], string> = {
  ACTIVE: 'Activa',
  PAUSED: 'Pausada',
  FINISHED: 'Finalizada',
};

export const CAMPAIGN_ROLE_LABELS: Record<CampaignMember['role'], string> = {
  DUNGEON_MASTER: 'Dungeon Master',
  PLAYER: 'Jugador',
};