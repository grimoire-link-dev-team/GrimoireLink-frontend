import { Monster } from '../../monsters/data-access/monster.model';

export type EncounterType =
  | 'COMBAT'
  | 'AMBUSH'
  | 'BOSS'
  | 'RANDOM'
  | 'NEGOTIATION'
  | 'INTERROGATION'
  | 'DIPLOMACY'
  | 'TRAP'
  | 'PUZZLE'
  | 'EXPLORATION'
  | 'CHASE'
  | 'STEALTH'
  | 'RITUAL'
  | 'NATURAL_HAZARD';

export type EncounterDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'DEADLY';

export type EncounterStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'SKIPPED';

export interface Encounter {
  publicId: string;
  encounterType: EncounterType;
  encounterDifficulty: EncounterDifficulty;
  description: string;
  encounterStatus: EncounterStatus;
  monsters: Monster[];
}

export interface EncounterRequest {
  campaignId: string;
  encounterType: EncounterType;
  encounterDifficulty: EncounterDifficulty;
  description: string;
}

export const ENCOUNTER_TYPE_LABELS: Record<EncounterType, string> = {
  COMBAT: 'Combate',
  AMBUSH: 'Emboscada',
  BOSS: 'Jefe',
  RANDOM: 'Aleatorio',
  NEGOTIATION: 'Negociación',
  INTERROGATION: 'Interrogatorio',
  DIPLOMACY: 'Diplomacia',
  TRAP: 'Trampa',
  PUZZLE: 'Acertijo',
  EXPLORATION: 'Exploración',
  CHASE: 'Persecución',
  STEALTH: 'Sigilo',
  RITUAL: 'Ritual',
  NATURAL_HAZARD: 'Peligro natural',
};

export const ENCOUNTER_DIFFICULTY_LABELS: Record<EncounterDifficulty, string> = {
  EASY: 'Fácil',
  MEDIUM: 'Media',
  HARD: 'Difícil',
  DEADLY: 'Mortal',
};

export const ENCOUNTER_STATUS_LABELS: Record<EncounterStatus, string> = {
  PLANNED: 'Planificado',
  ACTIVE: 'En curso',
  COMPLETED: 'Completado',
  FAILED: 'Fallido',
  SKIPPED: 'Omitido',
};