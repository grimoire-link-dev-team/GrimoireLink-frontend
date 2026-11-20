import { Routes } from '@angular/router';
import { ROUTE_SEGMENTS } from '../app.route.segments';
import { guestGuard } from './data-access/guest-guard';

export const authRoutes: Routes = [
  {
    path: ROUTE_SEGMENTS.login,
    canActivate: [guestGuard],
    loadComponent: () => import('./features/login/login').then(m => m.Login),
  },
  {
    path: ROUTE_SEGMENTS.register,
    canActivate: [guestGuard],
    loadComponent: () => import('./features/register/register').then(m => m.Register),
  },
];
