// Single source of truth for the app URLs.
// Keys are in English (code), values are the Spanish segments the user sees.
export const ROUTE_SEGMENTS = {
  login: 'login',
  register: 'register',
  home: 'inicio',
  characters: 'personajes',
  newCharacter: 'nuevo',
  characterId: ':characterId',
  campaigns: 'campanias',
  newCampaign: 'nueva',
  joinCampaign: 'unirse',
  campaignId: ':publicId',
  journal: 'diario',
  monsters: 'monstruos',
  dice: 'dados',
  encounters: 'encuentros',
} as const;

// Commands ready for routerLink and router.navigate.
// Routes with an id are functions so the id is always passed.
export const ROUTE_COMMANDS = {
  root: ['/'],
  login: [`/${ROUTE_SEGMENTS.login}`],
  register: [`/${ROUTE_SEGMENTS.register}`],
  home: [`/${ROUTE_SEGMENTS.home}`],
  characters: [`/${ROUTE_SEGMENTS.characters}`],
  newCharacter: [`/${ROUTE_SEGMENTS.characters}`, ROUTE_SEGMENTS.newCharacter],
  characterDetail: (characterId: string) => [`/${ROUTE_SEGMENTS.characters}`, characterId],
  campaigns: [`/${ROUTE_SEGMENTS.campaigns}`],
  newCampaign: [`/${ROUTE_SEGMENTS.campaigns}`, ROUTE_SEGMENTS.newCampaign],
  joinCampaign: [`/${ROUTE_SEGMENTS.campaigns}`, ROUTE_SEGMENTS.joinCampaign],
  campaignDetail: (campaignId: string) => [`/${ROUTE_SEGMENTS.campaigns}`, campaignId],
  journal: [`/${ROUTE_SEGMENTS.journal}`],
  monsters: [`/${ROUTE_SEGMENTS.monsters}`],
  dice: [`/${ROUTE_SEGMENTS.dice}`],
  encounters: [`/${ROUTE_SEGMENTS.encounters}`],
} as const;
