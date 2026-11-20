import { computed, effect, inject, Service, signal } from '@angular/core';
import { forkJoin, Subscription } from 'rxjs';

import { AuthService } from '../../auth/data-access/auth-service';
import { UserService } from '../../auth/data-access/user-service';
import { CampaignService } from './campaign-service';
import { Campaign, CampaignMember } from './campaign.model';

type CampaignRole = CampaignMember['role'];

@Service()
export class CampaignContextService {

  private readonly authService = inject(AuthService);
  private readonly campaignService = inject(CampaignService);
  private readonly userService = inject(UserService);

  private readonly userId = signal<string | null>(null);
  private loadSubscription?: Subscription;

  readonly campaigns = signal<Campaign[]>([]);
  readonly selectedId = signal<string | null>(null);

  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  readonly selectedRole = signal<CampaignRole | null>(null);
  readonly isRoleLoading = signal(false);
  readonly roleError = signal('');

  readonly previewPlayer = signal(false);

  readonly selectedCampaign = computed(() =>
    this.campaigns().find(
      campaign => campaign.publicId === this.selectedId()
    ) ?? null
  );

  readonly isRealDungeonMaster = computed(() =>
    this.selectedRole() === 'DUNGEON_MASTER'
  );

  readonly isDungeonMasterView = computed(() =>
    this.isRealDungeonMaster() && !this.previewPlayer()
  );

  readonly currentView = computed(() => {
    if (!this.selectedRole()) {
      return null;
    }

    return this.isDungeonMasterView()
      ? 'Dungeon Master'
      : 'Jugador';
  });

  constructor() {

    // Load the real membership role.

    effect((onCleanup) => {
      const campaignId = this.selectedId();
      const userId = this.userId();

      this.selectedRole.set(null);
      this.roleError.set('');

      if (!campaignId || !userId) {
        this.isRoleLoading.set(false);
        return;
      }

      this.isRoleLoading.set(true);

      const subscription = this.campaignService
        .getCampaignMembers(campaignId)
        .subscribe({
          next: members => {
            const member = members.find(
              item => item.publicId === userId
            );

            this.selectedRole.set(member?.role ?? null);

            if (!member) {
              this.roleError.set(
                'No se encontró tu membresía en esta campaña.'
              );
            }

            this.isRoleLoading.set(false);
          },
          error: () => {
            this.selectedRole.set(null);
            this.roleError.set(
              'No se pudo consultar tu rol en la campaña.'
            );
            this.isRoleLoading.set(false);
          }
        });

      onCleanup(() => subscription.unsubscribe());
    });

    // Reset the visual preview when membership changes.

    effect(() => {
      this.selectedId();
      this.selectedRole();

      this.previewPlayer.set(false);
    });
  }

  load(preferredId?: string): void {
    if (!this.authService.isAuthenticated()) {
      this.reset();
      return;
    }

    this.loadSubscription?.unsubscribe();

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.loadSubscription = forkJoin({
      user: this.userService.getCurrentUser(),
      campaigns: this.campaignService.getCampaigns()
    }).subscribe({
      next: ({ user, campaigns }) => {
        if (!this.authService.isAuthenticated()) {
          this.reset();
          return;
        }

        this.userId.set(user.publicId);
        this.campaigns.set(campaigns);

        const key = this.getStorageKey(user.publicId);
        const savedId = localStorage.getItem(key);

        const selected =
          campaigns.find(campaign =>
            campaign.publicId === preferredId
          ) ??
          campaigns.find(campaign =>
            campaign.publicId === savedId
          ) ??
          (campaigns.length === 1 ? campaigns[0] : null);

        this.selectedId.set(selected?.publicId ?? null);

        if (selected) {
          localStorage.setItem(key, selected.publicId);
        } else {
          localStorage.removeItem(key);
        }

        this.isLoading.set(false);
      },
      error: () => {
        this.campaigns.set([]);
        this.selectedId.set(null);
        this.userId.set(null);
        this.errorMessage.set(
          'No se pudieron cargar las campañas.'
        );
        this.isLoading.set(false);
      }
    });
  }

  selectCampaign(id: string): void {
    const selected = this.campaigns().find(
      campaign => campaign.publicId === id
    );

    this.selectedId.set(selected?.publicId ?? null);

    const userId = this.userId();

    if (!userId) {
      return;
    }

    const key = this.getStorageKey(userId);

    if (selected) {
      localStorage.setItem(key, selected.publicId);
    } else {
      localStorage.removeItem(key);
    }
  }

  changeView(): void {
    if (!this.isRealDungeonMaster()) {
      return;
    }

    this.previewPlayer.update(value => !value);
  }

  updateCampaign(updated: Campaign): void {
    this.campaigns.update(campaigns =>
      campaigns.map(campaign =>
        campaign.publicId === updated.publicId
          ? updated
          : campaign
      )
    );
  }

  reset(): void {
    this.loadSubscription?.unsubscribe();
    this.loadSubscription = undefined;

    this.userId.set(null);
    this.campaigns.set([]);
    this.selectedId.set(null);
    this.selectedRole.set(null);
    this.previewPlayer.set(false);

    this.isLoading.set(false);
    this.isRoleLoading.set(false);
    this.errorMessage.set('');
    this.roleError.set('');
  }

  private getStorageKey(userId: string): string {
    return `grimoirelink:campaign:${userId}`;
  }
}
