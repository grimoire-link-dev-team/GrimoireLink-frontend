import { Routes } from '@angular/router';
import { ROUTE_SEGMENTS } from '../app.route.segments';

export const campaignRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/campaign-list/campaign-list').then(m => m.CampaignList),
  },
  {
    // Fixed segments must go before the id route.
    path: ROUTE_SEGMENTS.newCampaign,
    loadComponent: () =>
      import('./features/campaign-form/campaign-form').then(m => m.CampaignForm),
  },
  {
    path: ROUTE_SEGMENTS.joinCampaign,
    loadComponent: () =>
      import('./features/campaign-join/campaign-join').then(m => m.CampaignJoin),
  },
  {
    path: ROUTE_SEGMENTS.campaignId,
    loadComponent: () =>
      import('./features/campaign-detail/campaign-detail').then(m => m.CampaignDetail),
  },
];
