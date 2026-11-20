//como devuelve de la dndapi

export interface DndReference {
  index: string;
  name: string;
  url: string;
}

export interface DndSpellReference extends DndReference {
  level: number;
}

export interface DndReferenceList {
  count: number;
  results: DndReference[];
}

export interface DndRule {
  index: string;
  name: string;
  subsections: DndReference[];
}

export interface DndAbilityScore {
  index: string;
  name: string;
  full_name: string;
  skills: DndReference[];
}

export interface DndRace {
  index: string;
  name: string;
  speed: number;
  size: string;
  ability_bonuses: { ability_score: DndReference; bonus: number }[];
}

export interface DndClass {
  index: string;
  name: string;
  hit_die: number;
  saving_throws: DndReference[];
  proficiency_choices?: DndProficiencyChoice[];
  subclasses?: DndReference[];
  spellcasting?: { level: number; spellcasting_ability: DndReference };
}

// /classes/{index}/levels/{level}: solo lo que usa la app.
export interface DndClassLevel {
  level: number;
  spellcasting?: DndSpellcasting;
}

export interface DndSpellcasting {
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

export interface DndProficiencyChoice {
  desc: string;
  choose: number;
  type: string;
  from: {
    option_set_type: string;
    options: { option_type: string; item?: DndReference }[];
  };
}

export interface DndMonster {
  index: string;
  name: string;
  size: string;
  type: string;
  alignment: string;
  armor_class: { type: string; value: number }[];
  hit_points: number;
  challenge_rating: number;
  image?: string;
}

export interface DndSpell {
  index: string;
  name: string;
  level: number;
  desc: string[];
  range: string;
  casting_time: string;
  school: DndReference;
}