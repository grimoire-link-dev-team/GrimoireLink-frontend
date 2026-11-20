// Reglas de hechizos compartidas por la ficha y el asistente de creación.

export interface SpellcastingInfo {
  cantrips_known?: number;
  spells_known?: number;
  spell_slots_level_1?: number;
  spell_slots_level_2?: number;
  spell_slots_level_3?: number;
  spell_slots_level_4?: number;
  spell_slots_level_5?: number;
  spell_slots_level_6?: number;
  spell_slots_level_7?: number;
  spell_slots_level_8?: number;
  spell_slots_level_9?: number;
}

export function slotsByLevel(info: SpellcastingInfo | null | undefined): { level: number; count: number }[] {
  if (!info) {
    return [];
  }

  return [
    info.spell_slots_level_1, info.spell_slots_level_2, info.spell_slots_level_3,
    info.spell_slots_level_4, info.spell_slots_level_5, info.spell_slots_level_6,
    info.spell_slots_level_7, info.spell_slots_level_8, info.spell_slots_level_9,
  ]
    .map((count, index) => ({ level: index + 1, count: count ?? 0 }))
    .filter(slot => slot.count > 0);
}

// Nivel de conjuro más alto con espacios disponibles (0 si no tiene).
export function maxSpellLevel(info: SpellcastingInfo | null | undefined): number {
  return slotsByLevel(info).reduce((max, slot) => Math.max(max, slot.level), 0);
}

export function spellLevelLabel(level: number | null): string {
  if (level === null) {
    return 'Nivel ?';
  }

  return level === 0 ? 'Truco' : `Nivel ${level}`;
}
