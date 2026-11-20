import { Component, computed, inject, input, output, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { form, FormField, min, required } from '@angular/forms/signals';
import { firstValueFrom, Observable } from 'rxjs';

import { CharacterService } from '../../data-access/character-service';
import { CharacterItem, CharacterResponse } from '../../data-access/character.model';
import { ItemPicker, PickedItem } from '../../ui/item-picker/item-picker';

@Component({
  imports: [FormField, ItemPicker],
  selector: 'app-character-inventory',
  styleUrl: './character-inventory.css',
  templateUrl: './character-inventory.html',
})
export class CharacterInventory {

  private readonly characterService = inject(CharacterService);

  readonly character = input.required<CharacterResponse>();
  readonly canEdit = input(false);

  readonly updated = output<CharacterResponse>();

  readonly pendingId = signal<string | null>(null);
  readonly errorMessage = signal('');

  readonly goldModel = signal({ amount: 1 });
  readonly goldForm = form(this.goldModel, (path) => {
    required(path.amount, { message: 'Ingresá una cantidad' });
    min(path.amount, 1, { message: 'La cantidad minima es 1' });
  });

  // Equipados primero, después por nombre.
  readonly items = computed<CharacterItem[]>(() =>
    [...(this.character().items ?? [])].sort((a, b) =>
      Number(b.equipped) - Number(a.equipped) || a.name.localeCompare(b.name)
    )
  );

  readonly equippedCount = computed(() => this.items().filter(item => item.equipped).length);

  readonly ownedIndexes = computed(() => this.items().map(item => item.itemIndex));

  // Oro

  changeGold(direction: 1 | -1): void {
    const field = this.goldForm.amount();

    if (field.invalid()) {
      field.markAsTouched();
      return;
    }

    const newGold = this.character().gold + direction * this.goldModel().amount;

    if (newGold < 0) {
      this.errorMessage.set('El personaje no tiene oro suficiente.');
      return;
    }

    this.run('gold', this.characterService.updateGold(this.character().publicId, newGold));
  }

  // Objetos

  addItem(item: PickedItem): void {
    this.run(item.itemIndex, this.characterService.addItem(this.character().publicId, {
      itemIndex: item.itemIndex,
      itemType: item.itemType,
    }));
  }

  removeItem(item: CharacterItem): void {
    this.run(item.publicId, this.characterService.removeItem(this.character().publicId, item.publicId));
  }

  toggleEquipped(item: CharacterItem): void {
    this.run(item.publicId, this.characterService.toggleEquippedItem(this.character().publicId, item.publicId));
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
          return 'No podés modificar el inventario de este personaje.';
        case 404:
          return 'No se encontró el objeto.';
        case 409:
          return 'El personaje ya tiene ese objeto.';
      }
    }

    return 'No se pudo actualizar el inventario. Intentá nuevamente.';
  }
}
