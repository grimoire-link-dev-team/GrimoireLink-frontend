export interface Monster {
  publicId: string;
  name: string;
  maxHp: number;
  currentHp: number;
  strength: number;
  dexterity: number;
  constitution: number;
  isAlive: boolean;
  challengeRating: number;
}

export interface MonsterReference {
  index: string;
  name: string;
  url: string;
}

export interface MonsterCatalogDetail {
  name: string;
  maxHp: number;
  currentHp: number;
  strength: number;
  dexterity: number;
  constitution: number;
  challengeRating: number;
}
