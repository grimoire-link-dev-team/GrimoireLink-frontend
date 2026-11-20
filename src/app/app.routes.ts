import { Routes } from '@angular/router';
import { authGuard } from './auth/data-access/auth-guard';
import { guestGuard } from './auth/data-access/guest-guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./auth/features/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./auth/features/register/register').then((m) => m.Register),
  },
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout').then((m) => m.MainLayout),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./home/features/home/home').then((m) => m.Home),
      },
      {
        path: '',
        canActivate: [authGuard],
        children: [          
          {
            path: 'inicio',
            loadComponent: () =>
              import('./home/features/home/home').then(m => m.Home),
          },
          {
            path: 'personajes',
            loadComponent: () =>
              import('./characters/features/character-list/character-list')
                .then(m => m.CharacterList),
          },
          {
            // Debe ir antes de 'personajes/:characterId' para que "nuevo" no se tome como id.
            path: 'personajes/nuevo',
            loadComponent: () =>
              import('./characters/features/character-create/character-create')
                .then(m => m.CharacterCreate),
          },
          {
            path: 'personajes/:characterId',
            loadComponent: () =>
              import('./characters/features/character-sheet/character-sheet')
                .then(m => m.CharacterSheet),
          },  
          {
            path: 'campanias',
            loadComponent: () =>
              import('./campaigns/features/campaign-list/campaign-list')
                .then(m => m.CampaignList),
          },
          {
            path: 'campanias/nueva',
            loadComponent: () =>
              import('./campaigns/features/campaign-form/campaign-form')
                .then(m => m.CampaignForm),
          },
          {
            path: 'campanias/unirse',
            loadComponent: () =>
              import('./campaigns/features/campaign-join/campaign-join')
                .then(m => m.CampaignJoin),
          },
          {
            path: 'campanias/:publicId',
            loadComponent: () =>
              import('./campaigns/features/campaign-detail/campaign-detail')
                .then(m => m.CampaignDetail),
          },
          {
            path: 'diario',
            loadComponent: () =>
              import('./journal/features/journal-page/journal-page')
                .then(m => m.JournalPage),
          },
          {
            path: 'monstruos',
            loadComponent: () => import('./monsters/features/bestiary/monsters').then((m) => m.Monsters),
          },
          {
            path: 'dados',
            loadComponent: () =>
              import('./shared/ui/dice-roller/dice-roller')
                .then(m => m.DiceRoller),
          },
          {
            path: 'encuentros',
           loadComponent: () => import('./encounters/features/encounter-detail/encounter-detail').then((m) => m.EncounterDetail),
          },
        ],
      },
    ],
  },
  { path: '**', redirectTo: '' },
];