import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { disabled, form, FormField } from '@angular/forms/signals';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { UserService } from '../../../auth/data-access/user-service';
import { CampaignEncounters } from '../../../encounters/features/campaign-encounters/campaign-encounters';
import { CampaignContextService } from '../../data-access/campaign-context-service';
import { CampaignService } from '../../data-access/campaign-service';
import {
  Campaign,
  CAMPAIGN_ROLE_LABELS,
  CAMPAIGN_STATUS_LABELS,
  CampaignMember,
} from '../../data-access/campaign.model';
import { ROUTE_COMMANDS } from '../../../app.route.segments';

@Component({
  imports: [RouterLink, DatePipe, FormField, CampaignEncounters],
  selector: 'app-campaign-detail',
  styleUrl: './campaign-detail.css',
  templateUrl: './campaign-detail.html',
})
export class CampaignDetail implements OnInit {
  protected readonly commands = ROUTE_COMMANDS;

  private readonly campaignService = inject(CampaignService);
  private readonly campaignContext = inject(CampaignContextService);
  private readonly userService = inject(UserService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly publicId = this.route.snapshot.paramMap.get('publicId');

  protected readonly campaign = signal<Campaign | null>(null);
  protected readonly members = signal<CampaignMember[]>([]);

  protected readonly isLoading = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly isDungeonMaster = signal(false);

  protected readonly errorMessage = signal('');
  protected readonly statusError = signal('');
  protected readonly statusSuccess = signal('');

  protected readonly statusModel = signal<{ status: Campaign['status'] }>({ status: 'ACTIVE' });
  protected readonly statusForm = form(this.statusModel, (path) => {
    disabled(path.status, () => this.isSaving());
  });

  ngOnInit() {
    if (!this.publicId) {
      this.router.navigate(ROUTE_COMMANDS.campaigns);
      return;
    }

    this.loadCampaignDetails(this.publicId);
  }

  protected retry() {
    if (this.publicId) {
      this.loadCampaignDetails(this.publicId);
    }
  }

  protected async saveStatus() {
    const campaign = this.campaign();
    const status = this.statusModel().status;

    if (!campaign || !this.isDungeonMaster() || this.isSaving() || campaign.status === status) {
      return;
    }

    this.isSaving.set(true);
    this.statusError.set('');
    this.statusSuccess.set('');

    try {
      const updated = await firstValueFrom(
        this.campaignService.updateCampaignStatus(campaign.publicId, status),
      );
      this.campaign.set(updated);
      this.statusModel.set({ status: updated.status });
      this.campaignContext.updateCampaign(updated);
      this.statusSuccess.set('Estado actualizado correctamente.');
    } catch (error) {
      this.statusError.set(
        error instanceof HttpErrorResponse && error.status === 403
          ? 'Solo el Dungeon Master puede cambiar el estado.'
          : 'No se pudo actualizar el estado.',
      );
    } finally {
      this.isSaving.set(false);
    }
  }

  protected getStatusLabel(status: Campaign['status']) {
    return CAMPAIGN_STATUS_LABELS[status] ?? 'Desconocido';
  }

  protected getRoleLabel(role: CampaignMember['role']) {
    return CAMPAIGN_ROLE_LABELS[role] ?? 'Desconocido';
  }

  private async loadCampaignDetails(publicId: string) {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.isDungeonMaster.set(false);

    try {
      const [campaign, members, user] = await Promise.all([
        firstValueFrom(this.campaignService.getCampaignById(publicId)),
        firstValueFrom(this.campaignService.getCampaignMembers(publicId)),
        firstValueFrom(this.userService.getCurrentUser()),
      ]);

      this.campaign.set(campaign);
      this.members.set(members);
      this.statusModel.set({ status: campaign.status });
      this.isDungeonMaster.set(
        members.some(
          (member) => member.publicId === user.publicId && member.role === 'DUNGEON_MASTER',
        ),
      );
    } catch (error) {
      this.errorMessage.set(this.getLoadErrorMessage(error));
    } finally {
      this.isLoading.set(false);
    }
  }

  private getLoadErrorMessage(error: unknown) {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 403) return 'No tenés permisos para ver esta campaña.';
      if (error.status === 404) return 'No se encontró la campaña.';
    }
    return 'No se pudo cargar la información de la campaña.';
  }
}