export const JOURNAL_ENTRY_OPTIONS = [
  { value: 'ENCOUNTER', label: 'Combate' },
  { value: 'BOSS_FIGHT', label: 'Combate contra jefe' },
  { value: 'NARRATIVE', label: 'Narrativa' },
  { value: 'STORY_MILESTONE', label: 'Hito de historia' },
  { value: 'REVELATION', label: 'Revelación' },
  { value: 'NPC_INTERACTION', label: 'Interacción con NPC' },
  { value: 'PLAYER_MOMENT', label: 'Momento del jugador' },
  { value: 'LOCATION_DISCOVERY', label: 'Descubrimiento' },
  { value: 'TRAVEL', label: 'Viaje' },
  { value: 'LOOT', label: 'Botin' },
  { value: 'LEVEL_UP', label: 'Subida de nivel' },
  { value: 'SESSION_START', label: 'Inicio de sesión' },
  { value: 'SESSION_END', label: 'Fin de sesión' },
  { value: 'DM_NOTE', label: 'Nota del DM' }
] as const;

export type JournalEntryType =
  typeof JOURNAL_ENTRY_OPTIONS[number]['value'];

export interface JournalEntry {
  publicId: string;
  journalEntryType: JournalEntryType;
  date: string;
  description: string;
  campaign?: {
    publicId: string;
    name: string;
  };
}

export interface JournalRequest {
  campaignId: string;
  journalEntryType: JournalEntryType;
  description: string;
}

export interface UpdateJournalRequest {
  journalEntryType?: JournalEntryType;
  description?: string;
}
