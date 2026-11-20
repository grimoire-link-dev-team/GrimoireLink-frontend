// Reglas de D&D 5e usadas por el asistente de creación.
// Las fórmulas de HP y bonificador replican las del backend (CharacterServiceImpl / CharacterMapper)
// para que la vista previa coincida con lo que se va a guardar.

export type AbilityKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';

export type AbilityScores = Record<AbilityKey, number>;

export type ScoreMethod = 'standard' | 'point-buy' | 'manual';

export const ABILITIES: { key: AbilityKey; name: string }[] = [
  { key: 'str', name: 'Fuerza' },
  { key: 'dex', name: 'Destreza' },
  { key: 'con', name: 'Constitución' },
  { key: 'int', name: 'Inteligencia' },
  { key: 'wis', name: 'Sabiduría' },
  { key: 'cha', name: 'Carisma' },
];

export const SCORE_METHODS: { value: ScoreMethod; label: string; hint: string }[] = [
  {
    value: 'standard',
    label: 'Valores estándar',
    hint: 'Asigná cada valor una sola vez: 15, 14, 13, 12, 10 y 8.',
  },
  {
    value: 'point-buy',
    label: 'Compra por puntos',
    hint: 'Tenés 27 puntos. Cada valor va de 8 a 15.',
  },
  {
    value: 'manual',
    label: 'Manual / tirada de dados',
    hint: 'Ingresá los valores que obtuviste (3 a 18).',
  },
];

export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

export const POINT_BUY_BUDGET = 27;

const POINT_BUY_COST: Record<number, number> = {
  8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9,
};

export const MAX_ABILITY_SCORE = 20;

export function defaultScores(method: ScoreMethod): AbilityScores {
  if (method === 'standard') {
    return { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 };
  }

  if (method === 'point-buy') {
    return { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 };
  }

  return { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
}

export function pointBuyCost(scores: AbilityScores): number | null {
  let total = 0;

  for (const { key } of ABILITIES) {
    const cost = POINT_BUY_COST[scores[key]];

    if (cost === undefined) {
      return null;
    }

    total += cost;
  }

  return total;
}

export function isStandardArray(scores: AbilityScores): boolean {
  const values = ABILITIES.map(({ key }) => scores[key]).sort((a, b) => b - a);

  return values.every((value, index) => value === STANDARD_ARRAY[index]);
}

export function modifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function proficiencyBonus(level: number): number {
  return Math.ceil(level / 4) + 1;
}

export function maxHitPoints(hitDie: number, level: number, constitution: number): number {
  const conMod = modifier(constitution);
  const average = Math.floor(hitDie / 2) + 1;

  return hitDie + conMod + (level - 1) * (average + conMod);
}

export function feetToMeters(feet: number): number {
  return Math.round(feet * 0.3 * 10) / 10;
}

export function formatBonus(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`;
}
