import { Component, computed, inject, input, output, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { form, FormField } from '@angular/forms/signals';

import { SrdService } from '../../../shared/data-access/srd-service';
import { ItemType } from '../../data-access/character.model';

export interface PickedItem {
  itemIndex: string;
  name: string;
  itemType: ItemType;
}

// Mas resultados que esto se piden refinar con la busqueda.
const MAX_RESULTS = 40;

const ITEM_TYPES: { value: ItemType; label: string }[] = [
  { value: 'EQUIPMENT', label: 'Equipo' },
  { value: 'MAGIC_ITEM', label: 'Objeto magico' },
];

// Buscador de objetos (dnd5eapi). No llama al backend: el padre decide que hacer al elegir.
@Component({
  imports: [FormField],
  selector: 'app-item-picker',
  styleUrl: '../picker.css',
  templateUrl: './item-picker.html',
})
export class ItemPicker {

  private readonly srdService = inject(SrdService);

  // Indices que ya tiene o ya eligio.
  readonly ownedIndexes = input<string[]>([]);
  readonly pendingIndex = input<string | null>(null);

  readonly picked = output<PickedItem>();

  protected readonly itemTypes = ITEM_TYPES;

  readonly itemType = signal<ItemType>('EQUIPMENT');

  readonly searchModel = signal({ search: '' });
  readonly searchForm = form(this.searchModel);

  readonly catalog = rxResource({
    params: () => this.itemType(),
    stream: ({ params }) =>
      this.srdService.getList(params === 'EQUIPMENT' ? 'equipment' : 'magic-items'),
  });

  private readonly owned = computed(() => new Set(this.ownedIndexes()));

  private readonly filtered = computed(() => {
    const search = this.searchModel().search.trim().toLowerCase();

    return (this.catalog.value() ?? [])
      .filter(item => !search || item.name.toLowerCase().includes(search));
  });

  readonly visible = computed(() => this.filtered().slice(0, MAX_RESULTS));

  readonly hiddenResults = computed(() => Math.max(0, this.filtered().length - MAX_RESULTS));

  selectType(type: ItemType): void {
    this.itemType.set(type);
  }

  isOwned(index: string): boolean {
    return this.owned().has(index);
  }

  pick(itemIndex: string, name: string): void {
    this.picked.emit({ itemIndex, name, itemType: this.itemType() });
  }
}
