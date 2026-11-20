import { HttpErrorResponse } from '@angular/common/http';
import {Component,computed,effect,inject,input,OnInit,signal,untracked,} from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { Monster, MonsterReference } from '../../../monsters/data-access/monster.model';
import { MonsterService } from '../../../monsters/data-access/monster-service';
import { EncounterService } from '../../data-access/encounter-service';
import { Encounter } from '../../data-access/encounter.model';

@Component({
  selector: 'app-enemy-manager',
  imports: [FormField],
  templateUrl: './enemy-manager.html',
  styleUrl: './enemy-manager.css',
})
export class EnemyManager {
 
  private readonly monsterService = inject(MonsterService);
  private readonly encounterService = inject(EncounterService);

  readonly encounterId = input<string | null>(null);
  readonly canEdit = input(false);

  readonly catalog = signal<MonsterReference[]>([]);
  readonly encounter = signal<Encounter | null>(null);

  protected readonly search = signal({ term: '' });
  protected readonly searchForm = form(this.search);
  readonly selectedMonster = signal<MonsterReference | null>(null);

  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly errorMessage = signal('');

  readonly filteredMonsters = computed(() => {
    const search = this.search().term.trim().toLowerCase();

    return this.catalog()
      .filter(monster =>
        monster.name.toLowerCase().includes(search)
      )
      .slice(0, 20);
  });

  constructor() {

    // Load the selected encounter.

    effect(() => {
      const encounterId = this.encounterId();

      untracked(() => {
        this.encounter.set(null);

        if (encounterId) {
          this.loadEncounter(encounterId);
        }
      });
    });

    // Load the catalog only when editing is available.

    effect(() => {
      if (this.canEdit()) {
        untracked(() => this.loadCatalog());
      }
    });
  }

  loadCatalog(): void {
    this.monsterService.getMonsters().subscribe({
      next: monsters => {
        this.catalog.set(monsters);
      },
      error: () => {
        this.errorMessage.set(
          'No se pudo cargar el catalogo de monstruos.'
        );
      }
    });
  }

  async loadEncounter(encounterId: string): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const encounter = await firstValueFrom(
        this.encounterService.getById(encounterId)
      );

      if (this.encounterId() === encounterId) {
        this.encounter.set(encounter);
      }
    } catch {
      this.errorMessage.set(
        'No se pudo cargar el encuentro.'
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  selectMonster(monster: MonsterReference): void {
    if (!this.canEdit()) {
      return;
    }

    this.selectedMonster.set(monster);
  }

  async addMonster(): Promise<void> {
    const monster = this.selectedMonster();
    const encounterId = this.encounterId();

    if (
      !this.canEdit() ||
      !monster ||
      !encounterId ||
      !this.encounter() ||
      this.isSaving()
    ) {
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');

    try {
      const updated = await firstValueFrom(
        this.encounterService.addMonster(
          encounterId,
          monster.index
        )
      );

      this.encounter.set(updated);
      this.selectedMonster.set(null);
      this.search.set({ term: '' });
    } catch (error) {
      this.errorMessage.set(
        this.getErrorMessage(error, 'No se pudo agregar el monstruo.')
      );
    } finally {
      this.isSaving.set(false);
    }
  }

  async updateHp(monsterId: string, newHp: number): Promise<void> {
    const encounterId = this.encounterId();

    if (
      !this.canEdit() ||
      !encounterId ||
      !this.encounter() ||
      this.isSaving() ||
      !Number.isInteger(newHp)
    ) {
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');

    try {
      const updated = await firstValueFrom(
        this.encounterService.updateMonsterHp(
          encounterId,
          monsterId,
          newHp
        )
      );

      this.encounter.set(updated);
    } catch (error) {
      this.errorMessage.set(
        this.getErrorMessage(
          error,
          'No se pudieron actualizar los puntos de golpe.'
        )
      );
    } finally {
      this.isSaving.set(false);
    }
  }

  damage(monster: Monster, amount: number): void {
    if (!this.canEdit()) {
      return;
    }

    if (!this.isValidAmount(amount)) {
      this.errorMessage.set(
        'Ingresa una cantidad entera mayor a 0.'
      );
      return;
    }

    this.updateHp(
      monster.publicId,
      Math.max(monster.currentHp - amount, 0)
    );
  }

  heal(monster: Monster, amount: number): void {
    if (!this.canEdit()) {
      return;
    }

    if (!this.isValidAmount(amount)) {
      this.errorMessage.set(
        'Ingresa una cantidad entera mayor a 0.'
      );
      return;
    }

    this.updateHp(
      monster.publicId,
      Math.min(monster.currentHp + amount, monster.maxHp)
    );
  }

  async removeMonster(monsterId: string): Promise<void> {
    const encounterId = this.encounterId();

    if (
      !this.canEdit() ||
      !encounterId ||
      !this.encounter() ||
      this.isSaving()
    ) {
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');

    try {
      const updated = await firstValueFrom(
        this.encounterService.removeMonster(
          encounterId,
          monsterId
        )
      );

      this.encounter.set(updated);
    } catch (error) {
      this.errorMessage.set(
        this.getErrorMessage(error, 'No se pudo quitar el monstruo.')
      );
    } finally {
      this.isSaving.set(false);
    }
  }

  private isValidAmount(amount: number): boolean {
    return Number.isInteger(amount) && amount > 0;
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse && error.status === 403) {
      return 'Solo el Dungeon Master puede modificar el encuentro.';
    }

    return fallback;
  }
}