import { Component, computed, input, output, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';

import { DndSpellReference } from '../../../shared/data-access/srd.model';
import { spellLevelLabel } from '../../data-access/spell-rules';

// Mas resultados que esto se piden refinar con la busqueda.
const MAX_RESULTS = 40;

// Buscador de hechizos de una clase. No llama al backend: el padre decide que hacer al elegir.
@Component({
  imports: [FormField],
  selector: 'app-spell-picker',
  styleUrl: '../picker.css',
  templateUrl: './spell-picker.html',
})
export class SpellPicker {

  // Hechizos de la clase (dnd5eapi), los carga el padre.
  readonly spells = input.required<DndSpellReference[]>();
  readonly loading = input(false);
  readonly failed = input(false);

  readonly maxSpellLevel = input(0);
  readonly allowCantrips = input(false);
  readonly cantripLimitReached = input(false);
  readonly spellLimitReached = input(false);

  // Nombres que ya conoce o ya eligio (no se ofrecen).
  readonly excludedNames = input<string[]>([]);
  readonly pendingIndex = input<string | null>(null);

  readonly picked = output<DndSpellReference>();

  protected readonly levelLabel = spellLevelLabel;

  readonly levelFilter = signal<number | null>(null);

  readonly searchModel = signal({ search: '' });
  readonly searchForm = form(this.searchModel);

  private readonly eligible = computed(() => {
    const excluded = new Set(this.excludedNames());

    return this.spells().filter(spell =>
      !excluded.has(spell.name) &&
      (spell.level === 0 ? this.allowCantrips() : spell.level <= this.maxSpellLevel())
    );
  });

  readonly levelOptions = computed(() =>
    [...new Set(this.eligible().map(spell => spell.level))].sort((a, b) => a - b)
  );

  private readonly filtered = computed(() => {
    const search = this.searchModel().search.trim().toLowerCase();
    const level = this.levelFilter();

    return this.eligible()
      .filter(spell => level === null || spell.level === level)
      .filter(spell => !search || spell.name.toLowerCase().includes(search))
      .sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
  });

  readonly visible = computed(() => this.filtered().slice(0, MAX_RESULTS));

  readonly hiddenResults = computed(() => Math.max(0, this.filtered().length - MAX_RESULTS));

  setLevelFilter(level: number | null): void {
    this.levelFilter.set(level);
  }

  isBlocked(spell: DndSpellReference): boolean {
    return spell.level === 0 ? this.cantripLimitReached() : this.spellLimitReached();
  }
}
