import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { form, FormField, FormRoot, maxLength } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { EncounterService } from '../../data-access/encounter-service';
import {
  Encounter,
  ENCOUNTER_DIFFICULTY_LABELS,
  ENCOUNTER_STATUS_LABELS,
  ENCOUNTER_TYPE_LABELS,
  EncounterDifficulty,
  EncounterStatus,
  EncounterType,
} from '../../data-access/encounter.model';
import { ROUTE_COMMANDS } from '../../../app.route.segments';

const EMPTY_ENCOUNTER = { encounterType: 'COMBAT', encounterDifficulty: 'MEDIUM', description: '' };

@Component({
  selector: 'app-campaign-encounters',
  imports: [FormField, FormRoot, RouterLink],
  templateUrl: './campaign-encounters.html',
  styleUrl: './campaign-encounters.css',
})
export class CampaignEncounters implements OnInit {
  protected readonly commands = ROUTE_COMMANDS;

  private readonly encounterService = inject(EncounterService);

  campaignId = input.required<string>();
  isDungeonMaster = input(false);

  encounters = signal<Encounter[]>([]);
  isLoading = signal(false);
  loadError = signal('');
  createError = signal('');
  showForm = signal(false);
  statusError = signal('');
  updatingId = signal<string | null>(null);

  // Los jugadores no ven los encuentros planificados en pantalla.
  // No es seguridad: el back igual los devuelve (pendiente para la tesis).
  visibleEncounters = computed(() =>
    this.isDungeonMaster()
      ? this.encounters()
      : this.encounters().filter((encounter) => encounter.encounterStatus !== 'PLANNED'),
  );

  protected readonly typeLabels = ENCOUNTER_TYPE_LABELS;
  protected readonly difficultyLabels = ENCOUNTER_DIFFICULTY_LABELS;
  protected readonly statusLabels = ENCOUNTER_STATUS_LABELS;
  protected readonly typeOptions = Object.entries(ENCOUNTER_TYPE_LABELS);
  protected readonly difficultyOptions = Object.entries(ENCOUNTER_DIFFICULTY_LABELS);
  protected readonly statusOptions = Object.entries(ENCOUNTER_STATUS_LABELS);

  encounterModel = signal({ ...EMPTY_ENCOUNTER });

  encounterForm = form(
    this.encounterModel,
    (path) => {
      maxLength(path.description, 2000, {
        message: 'La descripción no puede superar los 2000 caracteres',
      });
    },
    {
      submission: {
        action: async (field) => {
          this.createError.set('');
          const value = field().value();

          try {
            const created = await firstValueFrom(
              this.encounterService.add({
                campaignId: this.campaignId(),
                encounterType: value.encounterType as EncounterType,
                encounterDifficulty: value.encounterDifficulty as EncounterDifficulty,
                description: value.description.trim(),
              }),
            );

            this.encounters.update((encounters) => [...encounters, created]);
            this.closeForm();
          } catch (error) {
            this.createError.set(this.getCreateErrorMessage(error));
          }
        },
      },
    },
  );

  ngOnInit() {
    this.loadEncounters();
  }

  async loadEncounters() {
    this.isLoading.set(true);
    this.loadError.set('');

    try {
      this.encounters.set(
        await firstValueFrom(this.encounterService.getByCampaign(this.campaignId())),
      );
    } catch {
      this.loadError.set('No se pudieron cargar los encuentros.');
    } finally {
      this.isLoading.set(false);
    }
  }

  openForm() {
    this.createError.set('');
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
    this.encounterModel.set({ ...EMPTY_ENCOUNTER });
  }

  async changeStatus(encounterId: string, status: string) {
  this.statusError.set('');
  this.updatingId.set(encounterId);

  try {
    const updated = await firstValueFrom(
      this.encounterService.updateStatus(encounterId, status as EncounterStatus),
    );

    this.encounters.update((encounters) =>
      encounters.map((encounter) =>
        encounter.publicId === updated.publicId ? updated : encounter,
      ),
    );
  } catch {
    this.statusError.set('No se pudo cambiar el estado del encuentro.');
    await this.loadEncounters();
  } finally {
    this.updatingId.set(null);
  }
}

  private getCreateErrorMessage(error: unknown) {
    if (error instanceof HttpErrorResponse && error.status === 403) {
      return 'Solo el Dungeon Master puede crear encuentros.';
    }

    return 'No se pudo crear el encuentro.';
  }
}
