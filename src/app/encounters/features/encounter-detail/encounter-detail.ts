import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { CampaignContextService } from '../../../campaigns/data-access/campaign-context-service';
import { DiceRoller } from '../../../shared/ui/dice-roller/dice-roller';
import { CharacterManager } from '../character-manager/character-manager';
import { EnemyManager } from '../enemy-manager/enemy-manager';

@Component({
  imports: [CharacterManager, DiceRoller, EnemyManager],
  selector: 'app-encounter-detail',
  styleUrl: './encounter-detail.css',
  templateUrl: './encounter-detail.html',
})
export class EncounterDetail {
  private readonly campaignContext = inject(CampaignContextService);
  private readonly route = inject(ActivatedRoute);

  private readonly queryParams = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  protected readonly encounterId = computed(() => this.queryParams().get('encounterId'));
  protected readonly campaignId = computed(() => this.queryParams().get('campaignId'));

  // Only the DM of the active campaign, in DM view, can modify the encounter.
  protected readonly canEditEncounter = computed(
    () =>
      !!this.campaignId() &&
      this.campaignContext.selectedId() === this.campaignId() &&
      this.campaignContext.isDungeonMasterView(),
  );
}
