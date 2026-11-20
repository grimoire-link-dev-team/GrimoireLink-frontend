import { Component, signal } from '@angular/core';
import { form, FormField, max, min, required } from '@angular/forms/signals';

@Component({
  imports: [FormField],
  selector: 'app-dice-roller',
  styleUrl: './dice-roller.css',
  templateUrl: './dice-roller.html',
})
export class DiceRoller {
  protected readonly diceTypes = [4, 6, 8, 10, 12, 20, 100];

  protected readonly selectedDice = signal(20);
  protected readonly results = signal<number[]>([]);
  protected readonly total = signal<number | null>(null);
  protected readonly rolledModifier = signal(0);

  protected readonly rollModel = signal({ quantity: 1, modifier: 0 });

  protected readonly rollForm = form(this.rollModel, (path) => {
    required(path.quantity, { message: 'Ingresá una cantidad.' });
    min(path.quantity, 1, { message: 'Mínimo 1 dado.' });
    max(path.quantity, 20, { message: 'Máximo 20 dados.' });
    required(path.modifier, { message: 'Ingresá un modificador.' });
    min(path.modifier, -20, { message: 'El mínimo es -20.' });
    max(path.modifier, 20, { message: 'El máximo es 20.' });
  });

  protected rollDice() {
    if (this.rollForm().invalid()) {
      return;
    }

    const { quantity, modifier } = this.rollModel();

    if (!Number.isInteger(quantity) || !Number.isInteger(modifier)) {
      return;
    }

    const dice = this.selectedDice();
    const results = Array.from({ length: quantity }, () => Math.floor(Math.random() * dice) + 1);

    this.results.set(results);
    this.rolledModifier.set(modifier);
    this.total.set(results.reduce((sum, value) => sum + value, 0) + modifier);
  }

  protected selectDice(dice: number) {
    this.selectedDice.set(dice);
    this.results.set([]);
    this.total.set(null);
  }
}
