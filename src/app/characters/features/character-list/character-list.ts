import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError, firstValueFrom, of } from 'rxjs';
import { UserService } from '../../../auth/data-access/user-service';
import { CampaignContextService } from '../../../campaigns/data-access/campaign-context-service';
import { CharacterService } from '../../data-access/character-service';
import { CHARACTER_STATUS_LABELS, CharacterResponse } from '../../data-access/character.model';
import { ROUTE_COMMANDS } from '../../../app.route.segments';

@Component({
  imports: [NgTemplateOutlet, RouterLink],
  selector: 'app-character-list',
  styleUrl: './character-list.css',
  templateUrl: './character-list.html',
})
export class CharacterList {
  protected readonly commands = ROUTE_COMMANDS;

  private readonly characterService = inject(CharacterService);
  protected readonly campaignContext = inject(CampaignContextService);

  private readonly currentUser = toSignal(
    inject(UserService).getCurrentUser().pipe(catchError(() => of(null))),
    { initialValue: null },
  );

  protected readonly characters = signal<CharacterResponse[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');

  protected readonly campaignId = computed(() => this.campaignContext.selectedId());

  protected readonly myCharacters = computed(() => {
    const userId = this.currentUser()?.publicId;
    return this.characters().filter((character) => character.ownerPublicId === userId);
  });

  protected readonly partyCharacters = computed(() => {
    const userId = this.currentUser()?.publicId;
    return this.characters().filter((character) => character.ownerPublicId !== userId);
  });

  // Mismo criterio que el backend: un jugador puede tener un solo personaje vivo por campaña.
  protected readonly canCreate = computed(
    () =>
      this.campaignContext.selectedRole() === 'PLAYER' &&
      !this.myCharacters().some((character) => character.status === 'ALIVE'),
  );

  constructor() {
    effect(() => {
      const campaignId = this.campaignId();

      untracked(() => {
        this.characters.set([]);

        if (campaignId) {
          this.loadCharacters(campaignId);
        }
      });
    });
  }

  protected retry() {
    const campaignId = this.campaignId();

    if (campaignId) {
      this.loadCharacters(campaignId);
    }
  }

  protected getStatusLabel(status: CharacterResponse['status']) {
    return CHARACTER_STATUS_LABELS[status] ?? 'Desconocido';
  }

  protected getHpPercent(character: CharacterResponse) {
    if (!character.maxHP) {
      return 0;
    }
    return Math.round((character.currentHP / character.maxHP) * 100);
  }

  protected getHpLevel(character: CharacterResponse) {
    const percent = this.getHpPercent(character);
    if (percent > 50) return 'high';
    if (percent > 25) return 'mid';
    return 'low';
  }

  private async loadCharacters(campaignId: string) {
    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const characters = await firstValueFrom(this.characterService.getByCampaign(campaignId));

      if (this.campaignId() === campaignId) {
        this.characters.set(characters);
      }
    } catch {
      this.errorMessage.set('No se pudieron cargar los personajes.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
