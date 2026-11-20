import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MonsterService } from '../../data-access/monster-service';
import { catchError, forkJoin, of, Subscription } from 'rxjs';
import { MonsterCatalogDetail, MonsterReference } from '../../data-access/monster.model';
import { form, FormField } from '@angular/forms/signals';
import { DndMonster } from '../../../shared/data-access/srd.model';
import { SrdService } from '../../../shared/data-access/srd-service';

@Component({
  imports: [FormField],
  selector: 'app-monsters',
  styleUrl: './monsters.css',
  templateUrl: './monsters.html',
})
export class Monsters implements OnInit{
  private readonly monsterService = inject(MonsterService);
  private readonly srdService = inject(SrdService);

  private detailSubscription?: Subscription;
  private catalogSubscription?: Subscription;

  readonly monsters = signal<MonsterReference[]>([]);
  protected readonly search = signal({ term: '' });
  protected readonly searchForm = form(this.search);

  readonly selectedMonster = signal<MonsterReference | null>(null);
  readonly monsterDetail = signal<MonsterCatalogDetail | null>(null);

  readonly monsterImageUrl = signal<string | null>(null);

  readonly isLoading = signal(false);
  readonly isDetailLoading = signal(false);

  readonly errorMessage = signal('');
  readonly detailError = signal('');

  readonly filteredMonsters = computed(() => {
    const search = this.search().term.trim().toLowerCase();

    return this.monsters().filter(monster =>
      monster.name.toLowerCase().includes(search) ||
      monster.index.toLowerCase().includes(search)
    );
  });

  ngOnInit(): void {
    this.loadMonsters();
  }

  ngOnDestroy(): void {
    this.catalogSubscription?.unsubscribe();
    this.detailSubscription?.unsubscribe();
  }

  loadMonsters(): void {
    this.catalogSubscription?.unsubscribe();

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.catalogSubscription = this.monsterService
      .getMonsters()
      .subscribe({
        next: monsters => {
          this.monsters.set(monsters);
          this.isLoading.set(false);
        },
        error: () => {
          this.errorMessage.set(
            'No se pudo cargar el bestiario.'
          );
          this.isLoading.set(false);
        }
      });
  }

  selectMonster(monster: MonsterReference): void {
    if (this.selectedMonster()?.index === monster.index) {
      return;
    }

    this.detailSubscription?.unsubscribe();

    this.selectedMonster.set(monster);
    this.monsterDetail.set(null);
    this.monsterImageUrl.set(null);

    this.detailError.set('');
    this.isDetailLoading.set(true);

    // Load monster stats and optional illustration.

    this.detailSubscription = forkJoin({
      detail: this.monsterService.getMonsterFromApi(
        monster.index
      ),

      artwork: this.srdService
        .getOne<Pick<DndMonster, 'image'>>(
          'monsters',
          monster.index
        )
        .pipe(
          catchError(() => of(null))
        )
    }).subscribe({
      next: ({ detail, artwork }) => {
        this.monsterDetail.set(detail);

        this.monsterImageUrl.set(
          this.srdService.imageUrl(artwork?.image)
        );

        this.isDetailLoading.set(false);
      },

      error: () => {
        this.detailError.set(
          'No se pudo consultar el monstruo.'
        );

        this.isDetailLoading.set(false);
      }
    });
  }

  retryDetail(): void {
    const monster = this.selectedMonster();

    if (!monster) {
      return;
    }

    this.selectedMonster.set(null);
    this.selectMonster(monster);
  }

  clearSearch(): void {
    this.search.set({ term: '' });
  }

  onImageError(): void {
    this.monsterImageUrl.set(null);
  }
}
