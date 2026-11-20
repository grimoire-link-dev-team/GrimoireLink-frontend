
export interface CharacterSkill {
  publicId: string;
  skillIndex: string;
  name: string;
  proficiency: number;
}

export interface CharacterSpell {
  publicId: string;
  name: string;
  prepared: boolean;
}

export interface SpellSlots {
  cantrips_known: number;
  spells_known: number;
  spell_slots_level_1: number;
  spell_slots_level_2: number;
  spell_slots_level_3: number;
  spell_slots_level_4: number;
  spell_slots_level_5: number;
  spell_slots_level_6: number;
  spell_slots_level_7: number;
  spell_slots_level_8: number;
  spell_slots_level_9: number;
}

export interface CharacterResponse {
  publicId: string;
  name: string;
  race: string;
  characterClass: string;
  subclass: string | null;
  background: string | null;
  level: number;
  maxHP: number;
  currentHP: number;
  gold: number;
  status: 'ALIVE' | 'UNCONSCIOUS' | 'DEAD';
  proficiencyBonus: number;

  strengh: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;

  strenghMod: number;
  dexterityMod: number;
  constitutionMod: number;
  intelligenceMod: number;
  wisdomMod: number;
  charismaMod: number;

  skills: CharacterSkill[];
  knowSpells: CharacterSpell[];
  featureIndices: string[];
  items: CharacterItem[];
  spellSlots: SpellSlots | null;
  summary: string | null;

  ownerPublicId: string;
  ownerName: string;
}

export type ItemType = 'EQUIPMENT' | 'MAGIC_ITEM';

// Body de POST /api/characters/{id}/items
export interface AddItemRequest {
  itemIndex: string;
  itemType: ItemType;
}

export interface CharacterItem {
  publicId: string;
  itemIndex: string;
  name: string;
  equipped: boolean;
  quantity: number;
}

// Body de POST /api/characters?campaignId=
export interface CharacterCreateRequest {
  name: string;
  raceIndex: string;
  classIndex: string;
  subclassIndex: string | null;
  backgroundIndex: string;
  level: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  gold: number;
}

// GET /api/catalog/races y /api/catalog/classes
export interface CatalogItem {
  index: string;
  name: string;
}

// GET /api/catalog/backgrounds
export interface BackgroundCatalogItem extends CatalogItem {
  description: string;
}

export const CHARACTER_STATUS_LABELS: Record<CharacterResponse['status'], string> = {
  ALIVE: 'Vivo',
  UNCONSCIOUS: 'Inconsciente',
  DEAD: 'Muerto',
};
