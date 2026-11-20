import { Routes } from '@angular/router';
import { ROUTE_SEGMENTS } from './app.route.segments';
import { authRoutes } from './auth/auth.routes';
import { authGuard } from './auth/data-access/auth-guard';

export const routes: Routes = [
  ...authRoutes,
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout').then(m => m.MainLayout),
    children: [
      {
        // Public landing; Home shows the dashboard when the user is logged in.
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./home/features/home/home').then(m => m.Home),
      },
      {
        path: '',
        canActivate: [authGuard],
        children: [
          {
            path: ROUTE_SEGMENTS.home,
            loadComponent: () => import('./home/features/home/home').then(m => m.Home),
          },
          {
            path: ROUTE_SEGMENTS.characters,
            loadChildren: () => import('./characters/characters.routes').then(m => m.characterRoutes),
          },
          {
            path: ROUTE_SEGMENTS.campaigns,
            loadChildren: () => import('./campaigns/campaigns.routes').then(m => m.campaignRoutes),
          },
          {
            path: ROUTE_SEGMENTS.journal,
            loadComponent: () =>
              import('./journal/features/journal-page/journal-page').then(m => m.JournalPage),
          },
          {
            path: ROUTE_SEGMENTS.monsters,
            loadComponent: () =>
              import('./monsters/features/bestiary/monsters').then(m => m.Monsters),
          },
          {
            path: ROUTE_SEGMENTS.dice,
            loadComponent: () => import('./shared/ui/dice-roller/dice-roller').then(m => m.DiceRoller),
          },
          {
            path: ROUTE_SEGMENTS.encounters,
            loadComponent: () =>
              import('./encounters/features/encounter-detail/encounter-detail').then(
                m => m.EncounterDetail,
              ),
          },
        ],
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
