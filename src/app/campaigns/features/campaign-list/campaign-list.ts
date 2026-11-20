import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CampaignService } from '../../data-access/campaign-service';
import { Campaign, CAMPAIGN_STATUS_LABELS } from '../../data-access/campaign.model';
import { ROUTE_COMMANDS } from '../../../app.route.segments';

@Component({
  imports: [FormField, RouterLink],
  selector: 'app-campaign-list',
  styleUrl: './campaign-list.css',
  templateUrl: './campaign-list.html',
})
export class CampaignList implements OnInit {
  protected readonly commands = ROUTE_COMMANDS;

  private readonly campaignService = inject(CampaignService);

  protected readonly campaigns = signal<Campaign[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');

  protected readonly filters = signal({ search: '', status: 'ALL' });
  protected readonly filtersForm = form(this.filters);

  protected readonly filteredCampaigns = computed(() => {
    const search = this.filters().search.trim().toLowerCase();
    const status = this.filters().status;

    return this.campaigns().filter((campaign) => {
      const matchesName = campaign.name.toLowerCase().includes(search);
      const matchesStatus = status === 'ALL' || campaign.status === status;
      return matchesName && matchesStatus;
    });
  });

  ngOnInit() {
    this.loadCampaigns();
  }

  protected async loadCampaigns() {
    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      this.campaigns.set(await firstValueFrom(this.campaignService.getCampaigns()));
    } catch {
      this.errorMessage.set('No se pudieron cargar las campañas.');
    } finally {
      this.isLoading.set(false);
    }
  }

  protected getStatusLabel(status: Campaign['status']) {
    return CAMPAIGN_STATUS_LABELS[status] ?? 'Desconocido';
  }

  protected clearFilters() {
    this.filters.set({ search: '', status: 'ALL' });
  }
}