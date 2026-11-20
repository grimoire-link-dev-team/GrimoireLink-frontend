import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { DiceRoller } from '../../../shared/ui/dice-roller/dice-roller';
import { EnemyManager } from '../enemy-manager/enemy-manager';
import { CampaignContextService } from '../../../campaigns/data-access/campaign-context-service';

@Component({
  imports: [DiceRoller, EnemyManager],
  selector: 'app-encounter-detail',
  styleUrl: './encounter-detail.css',
  templateUrl: './encounter-detail.html',
})
export class EncounterDetail {
  
  readonly campaignContext = inject(CampaignContextService);
  private readonly route = inject(ActivatedRoute);

  private readonly queryParams = toSignal(
    this.route.queryParamMap,
    { initialValue: this.route.snapshot.queryParamMap }
  );

  readonly encounterId = computed(() =>
    this.queryParams().get('encounterId')
  );

  readonly campaignId = computed(() =>
    this.queryParams().get('campaignId')
  );

  readonly canEditEnemies = computed(() =>
    !!this.campaignId() &&
    this.campaignContext.selectedId() === this.campaignId() &&
    this.campaignContext.isDungeonMasterView()
  );

}
