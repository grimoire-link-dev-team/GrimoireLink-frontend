import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { CharacterService } from '../../../characters/data-access/character-service';
import { CHARACTER_STATUS_LABELS } from '../../../characters/data-access/character.model';
import { EncounterService } from '../../data-access/encounter-service';
import { Encounter, EncounterCharacter } from '../../data-access/encounter.model';

@Component({
  selector: 'app-character-manager',
  styleUrl: './character-manager.css',
  templateUrl: './character-manager.html',
})
export class CharacterManager {
  private readonly characterService = inject(CharacterService);
  private readonly encounterService = inject(EncounterService);

  readonly encounterId = input<string | null>(null);
  readonly campaignId = input<string | null>(null);
  readonly canEdit = input(false);

  // Reloads every time the encounter id changes.
  protected readonly encounter = rxResource({
    params: () => this.encounterId() ?? undefined,
    stream: ({ params }) => this.encounterService.getById(params),
  });

  // The campaign characters are only loaded when the DM can edit.
  protected readonly campaignCharacters = rxResource({
    params: () => (this.canEdit() ? (this.campaignId() ?? undefined) : undefined),
    stream: ({ params }) => this.characterService.getByCampaign(params),
    defaultValue: [],
  });

  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal('');

  // Campaign characters that can join: not dead and not already in the encounter.
  protected readonly candidates = computed(() => {
    if (!this.encounter.hasValue() || this.campaignCharacters.error()) {
      return [];
    }

    const inEncounter = new Set(this.encounter.value().characters.map(character => character.publicId));

    return this.campaignCharacters
      .value()
      .filter(character => character.status !== 'DEAD' && !inEncounter.has(character.publicId));
  });

  protected addCharacter(characterId: string) {
    this.save(
      encounterId => this.encounterService.addCharacter(encounterId, characterId),
      'No se pudo agregar el personaje.',
    );
  }

  protected damage(character: EncounterCharacter, amount: number) {
    if (this.isValidAmount(amount)) {
      this.updateHp(character.publicId, Math.max(character.currentHp - amount, 0));
    }
  }

  protected heal(character: EncounterCharacter, amount: number) {
    if (this.isValidAmount(amount)) {
      this.updateHp(character.publicId, Math.min(character.currentHp + amount, character.maxHp));
    }
  }

  protected removeCharacter(characterId: string) {
    this.save(
      encounterId => this.encounterService.removeCharacter(encounterId, characterId),
      'No se pudo quitar el personaje.',
    );
  }

  protected getStatusLabel(status: EncounterCharacter['status']) {
    return CHARACTER_STATUS_LABELS[status] ?? status;
  }

  protected getHpPercent(character: EncounterCharacter) {
    if (!character.maxHp) {
      return 0;
    }
    return Math.round((character.currentHp / character.maxHp) * 100);
  }

  protected getHpLevel(character: EncounterCharacter) {
    const percent = this.getHpPercent(character);
    if (percent > 50) return 'high';
    if (percent > 25) return 'mid';
    return 'low';
  }

  private updateHp(characterId: string, newHp: number) {
    this.save(
      encounterId => this.encounterService.updateCharacterHp(encounterId, characterId, newHp),
      'No se pudieron actualizar los puntos de golpe.',
    );
  }

  // Runs a change on the encounter and keeps the updated version returned by the backend.
  private async save(
    request: (encounterId: string) => ReturnType<EncounterService['getById']>,
    fallback: string,
  ) {
    const encounterId = this.encounterId();

    if (!this.canEdit() || !encounterId || !this.encounter.hasValue() || this.isSaving()) {
      return false;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');

    try {
      const updated: Encounter = await firstValueFrom(request(encounterId));
      this.encounter.value.set(updated);
      return true;
    } catch (error) {
      this.errorMessage.set(this.getErrorMessage(error, fallback));
      return false;
    } finally {
      this.isSaving.set(false);
    }
  }

  private isValidAmount(amount: number) {
    if (!this.canEdit()) {
      return false;
    }

    if (!Number.isInteger(amount) || amount <= 0) {
      this.errorMessage.set('Ingresá una cantidad entera mayor a 0.');
      return false;
    }

    return true;
  }

  private getErrorMessage(error: unknown, fallback: string) {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 403) return 'Solo el Dungeon Master puede modificar el encuentro.';
      if (error.status === 409) return 'El personaje ya está en el encuentro.';
    }

    return fallback;
  }
}
