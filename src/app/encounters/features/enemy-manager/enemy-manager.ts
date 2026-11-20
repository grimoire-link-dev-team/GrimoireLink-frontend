import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { form, FormField } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { Monster, MonsterReference } from '../../../monsters/data-access/monster.model';
import { MonsterService } from '../../../monsters/data-access/monster-service';
import { EncounterService } from '../../data-access/encounter-service';
import { Encounter } from '../../data-access/encounter.model';

@Component({
  imports: [FormField],
  selector: 'app-enemy-manager',
  styleUrl: './enemy-manager.css',
  templateUrl: './enemy-manager.html',
})
export class EnemyManager {
  private readonly monsterService = inject(MonsterService);
  private readonly encounterService = inject(EncounterService);

  readonly encounterId = input<string | null>(null);
  readonly canEdit = input(false);

  // Reloads every time the encounter id changes.
  protected readonly encounter = rxResource({
    params: () => this.encounterId() ?? undefined,
    stream: ({ params }) => this.encounterService.getById(params),
  });

  // The monster catalog is only loaded when the DM can edit.
  protected readonly catalog = rxResource({
    params: () => (this.canEdit() ? true : undefined),
    stream: () => this.monsterService.getMonsters(),
    defaultValue: [],
  });

  protected readonly search = signal({ term: '' });
  protected readonly searchForm = form(this.search);
  protected readonly selectedMonster = signal<MonsterReference | null>(null);

  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal('');

  protected readonly filteredMonsters = computed(() => {
    if (this.catalog.error()) {
      return [];
    }

    const search = this.search().term.trim().toLowerCase();

    return this.catalog
      .value()
      .filter(monster => monster.name.toLowerCase().includes(search))
      .slice(0, 20);
  });

  protected selectMonster(monster: MonsterReference) {
    if (this.canEdit()) {
      this.selectedMonster.set(monster);
    }
  }

  protected async addMonster() {
    const monster = this.selectedMonster();

    if (!monster) {
      return;
    }

    const added = await this.save(
      encounterId => this.encounterService.addMonster(encounterId, monster.index),
      'No se pudo agregar el monstruo.',
    );

    if (added) {
      this.selectedMonster.set(null);
      this.search.set({ term: '' });
    }
  }

  protected damage(monster: Monster, amount: number) {
    if (this.isValidAmount(amount)) {
      this.updateHp(monster.publicId, Math.max(monster.currentHp - amount, 0));
    }
  }

  protected heal(monster: Monster, amount: number) {
    if (this.isValidAmount(amount)) {
      this.updateHp(monster.publicId, Math.min(monster.currentHp + amount, monster.maxHp));
    }
  }

  protected removeMonster(monsterId: string) {
    this.save(
      encounterId => this.encounterService.removeMonster(encounterId, monsterId),
      'No se pudo quitar el monstruo.',
    );
  }

  private updateHp(monsterId: string, newHp: number) {
    this.save(
      encounterId => this.encounterService.updateMonsterHp(encounterId, monsterId, newHp),
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
    if (error instanceof HttpErrorResponse && error.status === 403) {
      return 'Solo el Dungeon Master puede modificar el encuentro.';
    }

    return fallback;
  }
}
