import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CharacterResponse } from '../../data-access/character.model';
import { CampaignContextService } from '../../../campaigns/data-access/campaign-context-service';
import { CharacterService } from '../../data-access/character-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { DndClass, DndRace } from '../../../shared/data-access/srd.model';
import { SrdService } from '../../../shared/data-access/srd-service';
import { catchError, forkJoin, of, switchMap } from 'rxjs';
import { UserService } from '../../../auth/data-access/user-service';
import { CharacterSpells } from '../character-spells/character-spells';
import { CharacterInventory } from '../character-inventory/character-inventory';


type SheetTab = 'sheet' | 'spells' | 'inventory';

interface Ability {
  name: string;
  shortName: string;
  score: number;
  modifier: number;
}

interface SavingThrow extends Ability {
  proficient: boolean;
  bonus: number | null;
}

@Component({
  imports: [RouterLink, CharacterSpells, CharacterInventory],
  selector: 'app-character-sheet',
  styleUrl: './character-sheet.css',
  templateUrl: './character-sheet.html',
})
export class CharacterSheet {


  readonly campaignContext = inject(CampaignContextService);

  private readonly characterService = inject(CharacterService);
  private readonly srdService = inject(SrdService);
  private readonly route = inject(ActivatedRoute);

  private readonly params = toSignal(
    this.route.paramMap,
    { initialValue: this.route.snapshot.paramMap }
  );

  private readonly queryParams = toSignal(
    this.route.queryParamMap,
    { initialValue: this.route.snapshot.queryParamMap }
  );

  readonly character = signal<CharacterResponse | null>(null);

  readonly raceDetails = signal<DndRace | null>(null);
  readonly classDetails = signal<DndClass | null>(null);

  readonly activeTab = signal<SheetTab>('sheet');

  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  private readonly reloadToken = signal(0);

  readonly characterId = computed(() =>
    this.params().get('characterId')
  );

  readonly campaignId = computed(() =>
    this.queryParams().get('campaignId') ??
    this.campaignContext.selectedId()
  );

  private readonly currentUser = toSignal(
    inject(UserService).getCurrentUser().pipe(catchError(() => of(null))),
    { initialValue: null }
  );

  // Edita el dueno del personaje o el DM de la campana.
  // El backend solo valida membresia, esto es control de interfaz.
  readonly canEdit = computed(() => {
    const character = this.character();
    const user = this.currentUser();

    if (!character || !user) {
      return false;
    }

    const isDungeonMaster =
      this.campaignContext.selectedId() === this.campaignId() &&
      this.campaignContext.isRealDungeonMaster();

    return character.ownerPublicId === user.publicId || isDungeonMaster;
  });

  // Nombres de raza y clase: el efecto de la D&D API solo se re-ejecuta si cambian,
  // no cada vez que se actualiza el personaje (hechizos, items, oro).
  private readonly raceName = computed(() =>
    this.character()?.race.trim().toLowerCase() ?? null
  );

  private readonly className = computed(() =>
    this.character()?.characterClass.trim().toLowerCase() ?? null
  );

  readonly inventorySummary = computed(() => {
    const items = this.character()?.items ?? [];

    return {
      total: items.length,
      equipped: items.filter(item => item.equipped).length,
    };
  });

  readonly campaignName = computed(() =>
    this.campaignContext.campaigns().find(
      campaign => campaign.publicId === this.campaignId()
    )?.name ?? null
  );

  // Character abilities

  readonly abilities = computed<Ability[]>(() => {
    const character = this.character();

    if (!character) {
      return [];
    }

    return [
      {
        name: 'Fuerza',
        shortName: 'str',
        score: character.strengh,
        modifier: character.strenghMod
      },
      {
        name: 'Destreza',
        shortName: 'dex',
        score: character.dexterity,
        modifier: character.dexterityMod
      },
      {
        name: 'Constitucion',
        shortName: 'con',
        score: character.constitution,
        modifier: character.constitutionMod
      },
      {
        name: 'Inteligencia',
        shortName: 'int',
        score: character.intelligence,
        modifier: character.intelligenceMod
      },
      {
        name: 'Sabiduria',
        shortName: 'wis',
        score: character.wisdom,
        modifier: character.wisdomMod
      },
      {
        name: 'Carisma',
        shortName: 'cha',
        score: character.charisma,
        modifier: character.charismaMod
      }
    ];
  });

  readonly savingThrows = computed<SavingThrow[]>(() => {
    const characterClass = this.classDetails();
    const character = this.character();

    return this.abilities().map(ability => {

      const proficient = characterClass?.saving_throws.some(
        saving =>
          saving.index.toLowerCase() === ability.shortName
      ) ?? false;

      const bonus = characterClass && character
        ? ability.modifier +
          (proficient ? character.proficiencyBonus : 0)
        : null;

      return {
        ...ability,
        proficient,
        bonus
      };
    });
  });

  // Character health

  readonly healthPercentage = computed(() => {
    const character = this.character();

    if (!character || character.maxHP <= 0) {
      return 0;
    }

    return Math.max(
      0,
      Math.min(
        100,
        (character.currentHP / character.maxHP) * 100
      )
    );
  });

  // Spells

  readonly preparedSpellsCount = computed(() =>
    (this.character()?.knowSpells ?? [])
      .filter(spell => spell.prepared)
      .length
  );

  constructor() {
    // Load character from Spring Boot

    effect((onCleanup) => {
      const characterId = this.characterId();
      const campaignId = this.campaignId();

      this.reloadToken();

      this.character.set(null);
      this.errorMessage.set('');

      if (!characterId || !campaignId) {
        this.isLoading.set(false);
        return;
      }

      this.isLoading.set(true);

      const subscription = this.characterService
        .getById(characterId, campaignId)
        .subscribe({
          next: character => {
            this.character.set(character);
            this.isLoading.set(false);
          },
          error: (error: HttpErrorResponse) => {
            if (error.status === 401) {
              this.errorMessage.set(
                'Tu sesion ha expirado. Inicia sesion nuevamente.'
              );
            } else if (error.status === 403) {
              this.errorMessage.set(
                'No tienes permiso para consultar este personaje.'
              );
            } else if (error.status === 404) {
              this.errorMessage.set(
                'No se encontro el personaje.'
              );
            } else {
              this.errorMessage.set(
                'No se pudo cargar la ficha del personaje.'
              );
            }

            this.isLoading.set(false);
          }
        });

      onCleanup(() => subscription.unsubscribe());
    });

    // Load race and class details from D&D API

    effect((onCleanup) => {
      const raceName = this.raceName();
      const className = this.className();

      this.raceDetails.set(null);
      this.classDetails.set(null);

      if (raceName === null || className === null) {
        return;
      }

      const raceRequest = this.srdService.getList('races').pipe(
        switchMap(races => {
          const race = races.find(ref =>
            ref.name.toLowerCase() === raceName ||
            ref.index.toLowerCase() === raceName
          );

          return race
            ? this.srdService.getOne<DndRace>('races', race.index)
            : of(null);
        }),
        catchError(() => of(null))
      );

      const classRequest = this.srdService.getList('classes').pipe(
        switchMap(classes => {
          const characterClass = classes.find(ref =>
            ref.name.toLowerCase() === className ||
            ref.index.toLowerCase() === className
          );

          return characterClass
            ? this.srdService.getOne<DndClass>(
                'classes',
                characterClass.index
              )
            : of(null);
        }),
        catchError(() => of(null))
      );

      const subscription = forkJoin({
        race: raceRequest,
        characterClass: classRequest
      }).subscribe({
        next: ({ race, characterClass }) => {
          this.raceDetails.set(race);
          this.classDetails.set(characterClass);
        }
      });

      onCleanup(() => subscription.unsubscribe());
    });
  }

  selectTab(tab: SheetTab): void {
    this.activeTab.set(tab);
  }

  // Los componentes de hechizos e inventario devuelven la ficha actualizada del backend.
  onCharacterUpdated(character: CharacterResponse): void {
    this.character.set(character);
  }

  retry(): void {
    this.reloadToken.update(value => value + 1);
  }

  formatBonus(value: number): string {
    return value >= 0 ? `+${value}` : `${value}`;
  }

  getStatusLabel(status: CharacterResponse['status']): string {
    switch (status) {
      case 'ALIVE':
        return 'Vivo';
      case 'UNCONSCIOUS':
        return 'Inconsciente';
      case 'DEAD':
        return 'Muerto';
      default:
        return 'Desconocido';
    }
  }
  
}
