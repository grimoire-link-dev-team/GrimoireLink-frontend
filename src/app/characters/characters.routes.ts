import { Routes } from '@angular/router';
import { ROUTE_SEGMENTS } from '../app.route.segments';

export const characterRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/character-list/character-list').then(m => m.CharacterList),
  },
  {
    // Must go before the id route so "nuevo" is not taken as an id.
    path: ROUTE_SEGMENTS.newCharacter,
    loadComponent: () =>
      import('./features/character-create/character-create').then(m => m.CharacterCreate),
  },
  {
    path: ROUTE_SEGMENTS.characterId,
    loadComponent: () =>
      import('./features/character-sheet/character-sheet').then(m => m.CharacterSheet),
  },
];
