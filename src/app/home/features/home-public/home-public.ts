import { Component, inject, input, OnInit, signal, WritableSignal } from '@angular/core';
import {RouterLink} from '@angular/router';
import { SrdService } from '../../../shared/data-access/srd-service';
import {map,Observable} from 'rxjs';

import {
  DndAbilityScore,
  DndClass,
  DndMonster,
  DndRace,
  DndReference,
  DndRule,
  DndSpell,
} from '../../../shared/data-access/srd.model';
import { ROUTE_COMMANDS } from '../../../app.route.segments';

interface InfoItem {
  title: string;
  description: string;
}

interface Section<T> {
  data: T | null;
  error: boolean;
}

const RULE_CHAPTERS: Record<string, string> = {
  'using-ability-scores':
    'Cómo se resuelven las acciones: tirás un d20, sumás tu modificador y comparás con la dificultad.',
  adventuring: 'Viajar, explorar, descansar y sobrevivir a trampas, enfermedades y al entorno.',
  combat:
    'El combate se juega por turnos según la iniciativa: moverse, atacar, cubrirse y curarse.',
  spellcasting:
    'Cómo funcionan los conjuros: espacios de conjuro, componentes, alcance y duración.',
};

const ABILITY_INFO: Record<string, { abbr: string; text: string }> = {
  str: { abbr: 'FUE', text: 'Poder físico y fuerza bruta.' },
  dex: { abbr: 'DES', text: 'Agilidad, reflejos y equilibrio.' },
  con: { abbr: 'CON', text: 'Salud, aguante y resistencia.' },
  int: { abbr: 'INT', text: 'Razonamiento y memoria.' },
  wis: { abbr: 'SAB', text: 'Percepción e intuición.' },
  cha: { abbr: 'CAR', text: 'Fuerza de personalidad.' },
}

@Component({
  imports: [RouterLink],
  selector: 'app-home-public',
  styleUrl: './home-public.css',
  templateUrl: './home-public.html',
})


export class HomePublic implements OnInit {
  protected readonly commands = ROUTE_COMMANDS;

  readonly isLoggedIn = input(false);

  private readonly srd = inject(SrdService);

  rules = signal<Section<DndRule[]>>({ data: null, error: false });
    abilities = signal<Section<DndAbilityScore[]>>({ data: null, error: false });
    races = signal<Section<DndRace[]>>({ data: null, error: false });
    classes = signal<Section<DndClass[]>>({ data: null, error: false });
    monster = signal<Section<DndMonster>>({ data: null, error: false });
    spell = signal<Section<DndSpell>>({ data: null, error: false });
    monsterCount = signal<number | null>(null);
    spellCount = signal<number | null>(null);

    slide = signal<'races' | 'classes'>('races');

    readonly pillars: InfoItem[] = [
      {
        title: 'Exploración',
        description: 'Recorrer mazmorras, ciudades y tierras salvajes buscando secretos.',
      },
      {
        title: 'Interacción social',
        description: 'Negociar, engañar o hacer aliados con los personajes del mundo.',
      },
      {
        title: 'Combate',
        description: 'Enfrentar monstruos por turnos usando armas, habilidades y conjuros.',
      },
    ];


    readonly steps: InfoItem[] = [
      { title: 'El DM crea la campaña', description: 'Y obtiene un código de invitación.' },
      {
        title: 'El grupo se une',
        description: 'Cada jugador entra con el código y crea su personaje.',
      },
      { title: 'Arranca la aventura', description: 'Encuentros, HP y diario, todo en un lugar.' },
    ];

    ngOnInit(): void {
      this.load(this.srd.getRules(Object.keys(RULE_CHAPTERS)), this.rules);

      
      const order = Object.keys(ABILITY_INFO);
      this.load(
        this.srd
          .getAbilityScores()
          .pipe(
            map((list) => [...list].sort((a, b) => order.indexOf(a.index) - order.indexOf(b.index))),
          ),
        this.abilities,
      );

      this.load(this.srd.getRaces(), this.races);
      this.load(this.srd.getClasses(), this.classes);
      this.loadMonster();
      this.loadSpell();
      this.srd.getCount('monsters').subscribe((n) => this.monsterCount.set(n));
      this.srd.getCount('spells').subscribe((n) => this.spellCount.set(n));
    }

    showSlide(slide: 'races' | 'classes', track: HTMLElement): void {
      this.slide.set(slide);
      track.scrollTo({ left: 0 });
    }

    scroll(track: HTMLElement, direction: 1 | -1): void {
      track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: 'smooth' });
    }

    loadMonster(): void {
      this.load(this.srd.getRandomMonster(), this.monster);
    }

    loadSpell(): void {
      this.load(this.srd.getRandomSpell(), this.spell);
    }

    ruleBlurb(index: string): string {
      return RULE_CHAPTERS[index] ?? '';
    }


    /// Para sacar duplicados porque la api devuelve   muchas veces las mismas cosas

    uniqueSections(rule: DndRule): DndReference[] {
      return rule.subsections.filter(
        (s, i, all) => all.findIndex((other) => other.index === s.index) === i,
      );
    }

    abilityAbbr(index: string): string {
      return ABILITY_INFO[index]?.abbr ?? index.toUpperCase();
    }

    abilityText(index: string): string {
      return ABILITY_INFO[index]?.text ?? '';
    }

    raceBonuses(race: DndRace): string {
      return race.ability_bonuses
        .map((b) => `+${b.bonus} ${this.abilityAbbr(b.ability_score.index)}`)
        .join(', ');
    }

    savingThrows(cls: DndClass): string {
      return cls.saving_throws.map((s) => this.abilityAbbr(s.index)).join(' · ');
    }

    //helpersin para convertir de pies a metros
    feetToMeters(feet: number): string {
      return `${((feet / 5) * 1.5).toLocaleString('es-AR')} m`;
    }

    imageUrl(monster: DndMonster): string | null {
      return this.srd.imageUrl(monster.image);
    }

    spellLevel(level: number): string {
      return level === 0 ? 'Truco' : `Nivel ${level}`;
    }

    
    private load<T>(source: Observable<T>, target: WritableSignal<Section<T>>): void {
      target.set({ data: null, error: false });
      source.subscribe({
        next: (data) => target.set({ data, error: false }),
        error: () => target.set({ data: null, error: true }),
      });
    }

}


