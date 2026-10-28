import { Dashboard } from './pages/dashboard/dashboard';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { MainLayout } from './layout/main-layout/main-layout';
import { Characters } from './pages/characters/characters';
import { Monsters } from './pages/monsters/monsters';
import { Encounters } from './pages/encounters/encounters';
import { Daily } from './pages/daily/daily';
import { Campaign } from './pages/campaign/campaign';
import { Routes } from '@angular/router';


export const routes: Routes = [
     { path: '', component: Home, pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'registro', component: Register },
  {
    path: '',
    component: MainLayout,
    children: [
      { path: 'inicio', component: Dashboard },
      { path: 'personajes', component: Characters },
      { path: 'campanias', component: Campaign},  
      { path: 'diario', component: Daily },
      { path: 'monstruos', component: Monsters },
      { path: 'encuentros', component: Encounters },
    ],
  },
  { path: '**', redirectTo: '' },
];
