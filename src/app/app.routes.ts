import { Routes } from '@angular/router';
import { authGuard } from './auth/data-access/auth-guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./auth/features/login/login').then((m) => m.Login),
  },
  {
    path: 'registro',
    loadComponent: () => import('./auth/features/register/register').then((m) => m.Register),
  },
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout').then((m) => m.MainLayout),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./pages/home/home').then((m) => m.Home),
      },
      {
        path: '',
        canActivate: [authGuard],
        children: [
          {
            path: 'inicio',
            loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
          },
          {
            path: 'personajes',
            loadComponent: () => import('./pages/characters/characters').then((m) => m.Characters),
          },
          {
            path: 'campanias',
            loadComponent: () => import('./pages/campaign/campaign').then((m) => m.Campaign),
          },
          {
            path: 'diario',
            loadComponent: () => import('./pages/notes/notes').then((m) => m.Notes),
          },
          {
            path: 'monstruos',
            loadComponent: () => import('./pages/monsters/monsters').then((m) => m.Monsters),
          },
          {
            path: 'encuentros',
            loadComponent: () => import('./pages/encounters/encounters').then((m) => m.Encounters),
          },
        ],
      },
    ],
  },
  { path: '**', redirectTo: '' },
];