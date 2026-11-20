import { Component, computed, effect, inject, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { form, FormField, FormRoot, max, min, required, validate } from '@angular/forms/signals';
import { catchError, firstValueFrom, of } from 'rxjs';

import { CampaignContextService } from '../../../campaigns/data-access/campaign-context-service';
import { SrdService } from '../../../shared/data-access/srd-service';
import { DndClass, DndRace, DndSpellReference } from '../../../shared/data-access/srd.model';
import { CatalogService } from '../../data-access/catalog-service';
import { CharacterService } from '../../data-access/character-service';
import { CharacterCreateRequest } from '../../data-access/character.model';
import { ItemPicker, PickedItem } from '../../ui/item-picker/item-picker';
import { SpellPicker } from '../../ui/spell-picker/spell-picker';
import { maxSpellLevel, spellLevelLabel } from '../../data-access/spell-rules';
import {
  ABILITIES,
  AbilityKey,
  AbilityScores,
  defaultScores,
  feetToMeters,
  formatBonus,
  isStandardArray,
  MAX_ABILITY_SCORE,
  maxHitPoints,
  modifier,
  POINT_BUY_BUDGET,
  pointBuyCost,
  proficiencyBonus,
  SCORE_METHODS,
  ScoreMethod,
} from '../../data-access/character-rules';
import { ROUTE_COMMANDS } from '../../../app.route.segments';

interface CharacterDraft {
  name: string;
  raceIndex: string;
  classIndex: string;
  subclassIndex: string;
  backgroundIndex: string;
  level: number;
  method: ScoreMethod;
  scores: AbilityScores;
  skills: string[];
  gold: number;
  items: PickedItem[];
  spells: DndSpellReference[];
  campaignId: string;
}

type EquipmentTab = 'inventory' | 'spells';

interface WizardStep {
  number: number;
  label: string;
}

interface SkillOption {
  index: string;
  name: string;
}

const DRAFT_KEY = 'grimoirelink:character-draft';

const STEPS: WizardStep[] = [
  { number: 1, label: 'Identidad' },
  { number: 2, label: 'Caracteristicas' },
  { number: 3, label: 'Equipo' },
  { number: 4, label: 'Revisar y crear' },
];

// Nivel a partir del cual se muestra la eleccion de subclase.
const SUBCLASS_LEVEL = 3;

@Component({
  imports: [FormField, FormRoot, RouterLink, ItemPicker, SpellPicker],
  selector: 'app-character-create',
  styleUrl: './character-create.css',
  templateUrl: './character-create.html',
})
export class CharacterCreate {
  protected readonly commands = ROUTE_COMMANDS;


  readonly campaignContext = inject(CampaignContextService);

  private readonly catalogService = inject(CatalogService);
  private readonly characterService = inject(CharacterService);
  private readonly srdService = inject(SrdService);
  private readonly router = inject(Router);

  protected readonly steps = STEPS;
  protected readonly abilityList = ABILITIES;
  protected readonly scoreMethods = SCORE_METHODS;
  protected readonly pointBuyBudget = POINT_BUY_BUDGET;
  protected readonly formatBonus = formatBonus;
  protected readonly spellLevelLabel = spellLevelLabel;

  readonly currentStep = signal(1);
  readonly maxReachedStep = signal(1);
  readonly equipmentTab = signal<EquipmentTab>('inventory');
  readonly submitError = signal('');

  // Si el personaje se creo pero fallo algun objeto o hechizo, queda el id para ir a la ficha.
  readonly createdCharacterId = signal<string | null>(null);
  readonly createdCampaignId = signal<string | null>(null);
  readonly lastSavedAt = signal<Date | null>(null);

  // Catalogos (backend)

  readonly races = toSignal(
    this.catalogService.getRaces().pipe(catchError(() => of([]))),
    { initialValue: [] }
  );

  readonly classes = toSignal(
    this.catalogService.getClasses().pipe(catchError(() => of([]))),
    { initialValue: [] }
  );

  readonly backgrounds = toSignal(
    this.catalogService.getBackgrounds().pipe(catchError(() => of([]))),
    { initialValue: [] }
  );

  // Formulario

  readonly draftModel = signal<CharacterDraft>(this.restoreDraft());

  readonly characterForm = form(
    this.draftModel,
    (path) => {
      required(path.name, { message: 'Elige un nombre para tu personaje' });
      required(path.raceIndex, { message: 'Elige un linaje' });
      required(path.classIndex, { message: 'Elige una clase' });
      required(path.backgroundIndex, { message: 'Elige un trasfondo' });
      required(path.campaignId, { message: 'Elegí la campaña del personaje' });

      required(path.level, { message: 'Indica el nivel inicial' });
      min(path.level, 1, { message: 'El nivel minimo es 1' });
      max(path.level, 20, { message: 'El nivel maximo es 20' });

      min(path.gold, 0, { message: 'El oro no puede ser negativo' });

      validate(path.scores, ({ value, valueOf }) =>
        this.validateScores(value(), valueOf(path.method))
      );

      validate(path.skills, ({ value }) => {
        const choose = this.skillChoice()?.choose ?? 0;

        return value().length === choose
          ? undefined
          : { kind: 'skills', message: `Elige ${choose} competencias de clase.` };
      });

      validate(path.spells, ({ value }) => this.validateSpells(value()));
    },
    {
      submission: {
        action: async () => this.createCharacter(),
      },
    }
  );

  // Datos de la D&D API para la raza y clase elegidas

  readonly raceDetails = rxResource({
    params: () => this.draftModel().raceIndex || undefined,
    stream: ({ params }) => this.srdService.getOne<DndRace>('races', params),
  });

  readonly classDetails = rxResource({
    params: () => this.draftModel().classIndex || undefined,
    stream: ({ params }) => this.srdService.getOne<DndClass>('classes', params),
  });

  // Espacios de conjuro de la clase en el nivel elegido.
  readonly classLevel = rxResource({
    params: () => {
      const { classIndex, level } = this.draftModel();
      return classIndex && level >= 1 && level <= 20 ? { classIndex, level } : undefined;
    },
    stream: ({ params }) => this.srdService.getClassLevel(params.classIndex, params.level),
  });

  readonly classSpells = rxResource({
    params: () => this.draftModel().classIndex || undefined,
    stream: ({ params }) => this.srdService.getClassSpells(params),
  });

  // Derivados para la vista

  readonly selectedRace = computed(() =>
    this.races().find(race => race.index === this.draftModel().raceIndex) ?? null
  );

  readonly selectedClass = computed(() =>
    this.classes().find(item => item.index === this.draftModel().classIndex) ?? null
  );

  readonly selectedBackground = computed(() =>
    this.backgrounds().find(item => item.index === this.draftModel().backgroundIndex) ?? null
  );

  readonly selectedCampaign = computed(() =>
    this.campaignContext.campaigns().find(
      campaign => campaign.publicId === this.draftModel().campaignId
    ) ?? null
  );

  readonly showSubclass = computed(() =>
    this.draftModel().level >= SUBCLASS_LEVEL &&
    (this.classDetails.value()?.subclasses?.length ?? 0) > 0
  );

  readonly subclassName = computed(() =>
    this.classDetails.value()?.subclasses?.find(
      item => item.index === this.draftModel().subclassIndex
    )?.name ?? null
  );

  readonly racialBonuses = computed<Partial<Record<AbilityKey, number>>>(() => {
    const bonuses: Partial<Record<AbilityKey, number>> = {};

    for (const bonus of this.raceDetails.value()?.ability_bonuses ?? []) {
      const key = bonus.ability_score.index as AbilityKey;
      bonuses[key] = (bonuses[key] ?? 0) + bonus.bonus;
    }

    return bonuses;
  });

  readonly racialBonusText = computed(() =>
    ABILITIES
      .filter(({ key }) => this.racialBonuses()[key])
      .map(({ key, name }) => `${formatBonus(this.racialBonuses()[key]!)} ${name}`)
      .join(' y ')
  );

  // Puntuacion final = base + bonus racial (tope 20). Es lo que se envia al backend.
  readonly finalScores = computed<AbilityScores>(() => {
    const base = this.draftModel().scores;
    const bonuses = this.racialBonuses();
    const result = { ...base };

    for (const { key } of ABILITIES) {
      result[key] = Math.min(MAX_ABILITY_SCORE, base[key] + (bonuses[key] ?? 0));
    }

    return result;
  });

  readonly finalModifiers = computed<AbilityScores>(() => {
    const scores = this.finalScores();
    const result = { ...scores };

    for (const { key } of ABILITIES) {
      result[key] = modifier(scores[key]);
    }

    return result;
  });

  readonly pointsSpent = computed(() => pointBuyCost(this.draftModel().scores));

  readonly scoreHint = computed(() =>
    SCORE_METHODS.find(method => method.value === this.draftModel().method)?.hint ?? ''
  );

  readonly skillChoice = computed(() =>
    this.classDetails.value()?.proficiency_choices?.find(choice =>
      choice.from.options.some(option => option.item?.index.startsWith('skill-'))
    ) ?? null
  );

  readonly skillOptions = computed<SkillOption[]>(() =>
    (this.skillChoice()?.from.options ?? [])
      .filter(option => option.item)
      .map(option => ({
        index: option.item!.index,
        name: option.item!.name.replace('Skill: ', ''),
      }))
  );

  readonly proficiency = computed(() => proficiencyBonus(this.draftModel().level || 1));

  readonly maxHp = computed(() => {
    const hitDie = this.classDetails.value()?.hit_die;

    return hitDie
      ? maxHitPoints(hitDie, this.draftModel().level || 1, this.finalScores().con)
      : null;
  });

  readonly initiative = computed(() => modifier(this.finalScores().dex));

  readonly speed = computed(() => {
    const feet = this.raceDetails.value()?.speed;
    return feet ? feetToMeters(feet) : null;
  });

  // Hechizos iniciales

  readonly spellcasting = computed(() => this.classLevel.value()?.spellcasting ?? null);

  readonly maxSpellLevel = computed(() => maxSpellLevel(this.spellcasting()));

  readonly cantripsAllowed = computed(() => this.spellcasting()?.cantrips_known ?? 0);

  // 0 = clase que prepara (mago, clerigo...): sin tope de conocidos.
  readonly spellsAllowed = computed(() => this.spellcasting()?.spells_known ?? 0);

  // Puede lanzar algo en el nivel elegido (el explorador nivel 1, por ejemplo, todavia no).
  readonly canCastNow = computed(() => this.maxSpellLevel() > 0 || this.cantripsAllowed() > 0);

  readonly pickedCantrips = computed(() =>
    this.draftModel().spells.filter(spell => spell.level === 0).length
  );

  readonly pickedLeveled = computed(() =>
    this.draftModel().spells.filter(spell => spell.level > 0).length
  );

  readonly cantripLimitReached = computed(() => this.pickedCantrips() >= this.cantripsAllowed());

  readonly spellLimitReached = computed(() =>
    this.spellsAllowed() > 0 && this.pickedLeveled() >= this.spellsAllowed()
  );

  readonly pickedSpellNames = computed(() => this.draftModel().spells.map(spell => spell.name));

  readonly pickedItemIndexes = computed(() => this.draftModel().items.map(item => item.itemIndex));

  readonly isDungeonMasterOfSelection = computed(() =>
    this.draftModel().campaignId === this.campaignContext.selectedId() &&
    this.campaignContext.isRealDungeonMaster()
  );

  readonly stepValid = computed(() => ({
    1: this.fieldsValid(1),
    2: this.fieldsValid(2),
    3: this.fieldsValid(3),
    4: this.fieldsValid(4),
  } as Record<number, boolean>));

  constructor() {
    // The character always belongs to the active campaign (also after a draft reset).
    effect(() => {
      const campaignId = this.campaignContext.selectedId() ?? '';

      if (this.draftModel().campaignId !== campaignId) {
        this.characterForm.campaignId().value.set(campaignId);
      }
    });

    // Si cambia la clase, se descartan competencias que ya no son validas.
    effect(() => {
      const options = this.skillOptions();
      const skills = this.draftModel().skills;

      if (!options.length) {
        return;
      }

      const valid = skills.filter(skill => options.some(option => option.index === skill));

      if (valid.length !== skills.length) {
        this.characterForm.skills().value.set(valid);
      }
    });

    // Si cambia la clase o el nivel, se descartan hechizos que ya no corresponden.
    effect(() => {
      // Sin datos cargados no se toca nada (evita borrar un borrador restaurado).
      if (this.classSpells.value() === undefined || this.classLevel.value() === undefined) {
        return;
      }

      const classSpellNames = new Set((this.classSpells.value() ?? []).map(spell => spell.name));
      const spells = this.draftModel().spells;

      const valid = spells.filter(spell =>
        classSpellNames.has(spell.name) &&
        (spell.level === 0 ? this.cantripsAllowed() > 0 : spell.level <= this.maxSpellLevel())
      );

      if (valid.length !== spells.length) {
        this.characterForm.spells().value.set(valid);
      }
    });

    // Autoguardado del borrador.
    effect(() => {
      const draft = this.draftModel();

      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        this.lastSavedAt.set(new Date());
      } catch {
        // Sin almacenamiento disponible: el borrador solo vive en memoria.
      }
    });
  }

  // Navegacion entre pasos

  goToStep(step: number): void {
    if (step <= this.maxReachedStep()) {
      this.currentStep.set(step);
    }
  }

  next(): void {
    const step = this.currentStep();

    if (!this.fieldsValid(step)) {
      this.stepFields(step).forEach(field => field().markAsTouched());

      // El error de hechizos solo se ve en su solapa.
      if (step === 3 && this.characterForm.spells().invalid()) {
        this.equipmentTab.set('spells');
      }

      return;
    }

    const nextStep = Math.min(step + 1, STEPS.length);
    this.currentStep.set(nextStep);
    this.maxReachedStep.update(value => Math.max(value, nextStep));
  }

  previous(): void {
    this.currentStep.update(step => Math.max(1, step - 1));
  }

  // Caracteristicas

  changeMethod(method: ScoreMethod): void {
    this.draftModel.update(draft => ({ ...draft, method, scores: defaultScores(method) }));
  }

  resetScores(): void {
    this.changeMethod(this.draftModel().method);
  }

  toggleSkill(index: string): void {
    const skills = this.draftModel().skills;
    const next = skills.includes(index)
      ? skills.filter(skill => skill !== index)
      : [...skills, index];

    this.characterForm.skills().value.set(next);
    this.characterForm.skills().markAsTouched();
  }

  isSkillDisabled(index: string): boolean {
    const choose = this.skillChoice()?.choose ?? 0;
    const skills = this.draftModel().skills;

    return !skills.includes(index) && skills.length >= choose;
  }

  // Equipo y hechizos iniciales (se envian despues de crear el personaje)

  selectEquipmentTab(tab: EquipmentTab): void {
    this.equipmentTab.set(tab);
  }

  addDraftItem(item: PickedItem): void {
    this.characterForm.items().value.update(items => [...items, item]);
  }

  removeDraftItem(itemIndex: string): void {
    this.characterForm.items().value.update(items =>
      items.filter(item => item.itemIndex !== itemIndex)
    );
  }

  addDraftSpell(spell: DndSpellReference): void {
    const { index, name, level } = spell;

    this.characterForm.spells().value.update(spells => [...spells, { index, name, level, url: '' }]);
    this.characterForm.spells().markAsTouched();
  }

  removeDraftSpell(index: string): void {
    this.characterForm.spells().value.update(spells =>
      spells.filter(spell => spell.index !== index)
    );
  }

  goToCreatedCharacter(): void {
    const characterId = this.createdCharacterId();

    if (!characterId) {
      return;
    }

    this.router.navigate(ROUTE_COMMANDS.characterDetail(characterId), {
      queryParams: { campaignId: this.createdCampaignId() },
    });
  }

  // Borrador

  saveAndExit(): void {
    this.router.navigate(ROUTE_COMMANDS.characters);
  }

  discardDraft(): void {
    this.clearDraft();
    this.draftModel.set(this.emptyDraft());
    this.currentStep.set(1);
    this.maxReachedStep.set(1);
  }

  // Envio

  private async createCharacter(): Promise<void> {
    this.submitError.set('');

    const draft = this.draftModel();
    const scores = this.finalScores();

    const request: CharacterCreateRequest = {
      name: draft.name.trim(),
      raceIndex: draft.raceIndex,
      classIndex: draft.classIndex,
      subclassIndex: this.showSubclass() && draft.subclassIndex ? draft.subclassIndex : null,
      backgroundIndex: draft.backgroundIndex,
      level: draft.level,
      strength: scores.str,
      dexterity: scores.dex,
      constitution: scores.con,
      intelligence: scores.int,
      wisdom: scores.wis,
      charisma: scores.cha,
      gold: draft.gold,
    };

    let createdId: string;

    try {
      const created = await firstValueFrom(
        this.characterService.create(request, draft.campaignId)
      );
      createdId = created.publicId;
    } catch (error) {
      this.submitError.set(this.getErrorMessage(error));
      return;
    }

    // El personaje ya existe: el borrador no se reutiliza para no crearlo dos veces.
    this.clearDraft();
    this.createdCharacterId.set(createdId);
    this.createdCampaignId.set(draft.campaignId);

    // El backend no recibe objetos ni hechizos al crear: se agregan uno por uno.
    const failed: string[] = [];

    for (const item of draft.items) {
      try {
        await firstValueFrom(this.characterService.addItem(createdId, {
          itemIndex: item.itemIndex,
          itemType: item.itemType,
        }));
      } catch {
        failed.push(item.name);
      }
    }

    for (const spell of draft.spells) {
      try {
        await firstValueFrom(this.characterService.addSpell(createdId, spell.index));
      } catch {
        failed.push(spell.name);
      }
    }

    if (failed.length) {
      this.submitError.set(
        `El personaje se creo, pero no se pudo agregar: ${failed.join(', ')}. Puedes agregarlo desde la ficha.`
      );
      return;
    }

    this.goToCreatedCharacter();
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      switch (error.status) {
        case 0:
          return 'No se pudo conectar con el servidor.';
        case 400:
          return 'Revisa los datos del personaje.';
        case 401:
          return 'Tu sesion ha expirado. Inicia sesion nuevamente.';
        case 403:
          return 'El Dungeon Master no puede crear personajes en esta campana.';
        case 404:
          return 'No se encontro la campana, la clase, el linaje o el trasfondo elegido.';
        case 409:
          return 'Ya tienes un personaje vivo en esta campana.';
      }
    }

    return 'No se pudo crear el personaje. Intenta nuevamente.';
  }

  // Helpers

  private stepFields(step: number) {
    const f = this.characterForm;

    switch (step) {
      case 1:
        return [f.name, f.raceIndex, f.classIndex, f.backgroundIndex, f.level];
      case 2:
        return [f.scores, f.skills];
      case 3:
        return [f.gold, f.spells];
      default:
        return [f.campaignId];
    }
  }

  private fieldsValid(step: number): boolean {
    return this.stepFields(step).every(field => field().valid());
  }

  private validateScores(scores: AbilityScores, method: ScoreMethod) {
    const values = ABILITIES.map(({ key }) => scores[key]);

    if (values.some(value => value === null || Number.isNaN(value))) {
      return { kind: 'scores', message: 'Completa todas las caracteristicas.' };
    }

    if (method === 'standard' && !isStandardArray(scores)) {
      return { kind: 'scores', message: 'Usa cada valor estandar una sola vez: 15, 14, 13, 12, 10 y 8.' };
    }

    if (method === 'point-buy') {
      const spent = pointBuyCost(scores);

      if (spent === null) {
        return { kind: 'scores', message: 'En compra por puntos cada valor va de 8 a 15.' };
      }

      if (spent > POINT_BUY_BUDGET) {
        return { kind: 'scores', message: `Gastaste ${spent} de ${POINT_BUY_BUDGET} puntos.` };
      }
    }

    if (method === 'manual' && values.some(value => value < 3 || value > 18)) {
      return { kind: 'scores', message: 'Cada valor debe estar entre 3 y 18.' };
    }

    return undefined;
  }

  private validateSpells(spells: DndSpellReference[]) {
    const cantrips = spells.filter(spell => spell.level === 0).length;
    const leveled = spells.length - cantrips;

    if (cantrips > this.cantripsAllowed()) {
      return { kind: 'spells', message: `Puedes elegir hasta ${this.cantripsAllowed()} trucos.` };
    }

    if (this.spellsAllowed() > 0 && leveled > this.spellsAllowed()) {
      return { kind: 'spells', message: `Puedes elegir hasta ${this.spellsAllowed()} conjuros.` };
    }

    return undefined;
  }

  private emptyDraft(): CharacterDraft {
    return {
      name: '',
      raceIndex: '',
      classIndex: '',
      subclassIndex: '',
      backgroundIndex: '',
      level: 1,
      method: 'standard',
      scores: defaultScores('standard'),
      skills: [],
      gold: 0,
      items: [],
      spells: [],
      campaignId: '',
    };
  }

  private restoreDraft(): CharacterDraft {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      return saved ? { ...this.emptyDraft(), ...JSON.parse(saved) } : this.emptyDraft();
    } catch {
      return this.emptyDraft();
    }
  }

  private clearDraft(): void {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      // Nada que limpiar.
    }
  }
}
