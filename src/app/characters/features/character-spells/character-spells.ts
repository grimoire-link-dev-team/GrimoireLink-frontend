import { Component, computed, inject, input, output, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';

import { DndSpellReference } from '../../../shared/data-access/srd.model';
import { SrdService } from '../../../shared/data-access/srd-service';
import { CharacterService } from '../../data-access/character-service';
import { CharacterResponse } from '../../data-access/character.model';
import { SpellPicker } from '../../ui/spell-picker/spell-picker';
import { maxSpellLevel, slotsByLevel, spellLevelLabel } from '../../data-access/spell-rules';

interface KnownSpell {
  publicId: string;
  name: string;
  prepared: boolean;
  level: number | null;
}

@Component({
  imports: [SpellPicker],
  selector: 'app-character-spells',
  styleUrl: './character-spells.css',
  templateUrl: './character-spells.html',
})
export class CharacterSpells {

  private readonly characterService = inject(CharacterService);
  private readonly srdService = inject(SrdService);

  readonly character = input.required<CharacterResponse>();
  readonly classIndex = input<string | null>(null);
  readonly canEdit = input(false);

  readonly updated = output<CharacterResponse>();

  protected readonly levelLabel = spellLevelLabel;

  readonly pendingId = signal<string | null>(null);
  readonly errorMessage = signal('');

  // Lista de hechizos de la clase (dnd5eapi), con su nivel.
  readonly classSpells = rxResource({
    params: () => this.classIndex() ?? undefined,
    stream: ({ params }) => this.srdService.getClassSpells(params),
  });

  readonly slots = computed(() => this.character().spellSlots);

  readonly isCaster = computed(() => !!this.slots());

  readonly cantripsAllowed = computed(() => this.slots()?.cantrips_known ?? 0);

  readonly spellsAllowed = computed(() => this.slots()?.spells_known ?? 0);

  readonly maxSpellLevel = computed(() => maxSpellLevel(this.slots()));

  readonly slotsByLevel = computed(() => slotsByLevel(this.slots()));

  private readonly levelByName = computed(() =>
    new Map((this.classSpells.value() ?? []).map(spell => [spell.name, spell.level]))
  );

  // El backend no devuelve el index ni el nivel de los conocidos: se cruzan por nombre.
  readonly knownSpells = computed<KnownSpell[]>(() =>
    (this.character().knowSpells ?? [])
      .map(spell => ({ ...spell, level: this.levelByName().get(spell.name) ?? null }))
      .sort((a, b) => (a.level ?? 99) - (b.level ?? 99) || a.name.localeCompare(b.name))
  );

  readonly knownNames = computed(() => this.knownSpells().map(spell => spell.name));

  readonly knownCantrips = computed(() =>
    this.knownSpells().filter(spell => spell.level === 0).length
  );

  readonly knownLeveled = computed(() =>
    this.knownSpells().filter(spell => spell.level !== 0).length
  );

  readonly preparedCount = computed(() =>
    this.knownSpells().filter(spell => spell.prepared).length
  );

  // spells_known = 0 significa clase que prepara (mago, clerigo...): sin tope de conocidos.
  readonly spellLimitReached = computed(() =>
    this.spellsAllowed() > 0 && this.knownLeveled() >= this.spellsAllowed()
  );

  readonly cantripLimitReached = computed(() =>
    this.knownCantrips() >= this.cantripsAllowed()
  );

  addSpell(spell: DndSpellReference): void {
    this.run(spell.index, this.characterService.addSpell(this.character().publicId, spell.index));
  }

  removeSpell(spell: KnownSpell): void {
    this.run(spell.publicId, this.characterService.removeSpell(this.character().publicId, spell.publicId));
  }

  togglePrepared(spell: KnownSpell): void {
    this.run(spell.publicId, this.characterService.togglePreparedSpell(this.character().publicId, spell.publicId));
  }

  private async run(id: string, request: Observable<CharacterResponse>): Promise<void> {
    if (this.pendingId()) {
      return;
    }

    this.pendingId.set(id);
    this.errorMessage.set('');

    try {
      this.updated.emit(await firstValueFrom(request));
    } catch (error) {
      this.errorMessage.set(this.getErrorMessage(error));
    } finally {
      this.pendingId.set(null);
    }
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      switch (error.status) {
        case 0:
          return 'No se pudo conectar con el servidor.';
        case 403:
          return 'No puedes modificar los hechizos de este personaje.';
        case 404:
          return 'No se encontro el hechizo.';
        case 409:
          return 'El personaje ya conoce ese hechizo.';
      }
    }

    return 'No se pudo actualizar los hechizos. Intenta nuevamente.';
  }
}
