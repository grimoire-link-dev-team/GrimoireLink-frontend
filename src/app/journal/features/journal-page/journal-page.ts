import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {Component,computed,effect,inject,signal} from '@angular/core';
import {form,FormField,FormRoot,maxLength,required} from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CampaignContextService } from '../../../campaigns/data-access/campaign-context-service';
import { JournalService } from '../../data-access/journal-service';
import {JournalEntry,JournalEntryType,JOURNAL_ENTRY_OPTIONS} from '../../data-access/journal.model';
import { SidebarSummaryService } from '../../../layout/data-access/sidebar-summary-service';
import { ROUTE_COMMANDS } from '../../../app.route.segments';
import { ConfirmationService } from '../../../shared/data-access/confirmation-service';

interface JournalFormModel {
  journalEntryType: JournalEntryType;
  description: string;
}

const EMPTY_JOURNAL: JournalFormModel = {
  journalEntryType: 'NARRATIVE',
  description: ''
};

@Component({
  selector: 'app-journal-page',
  imports: [RouterLink, DatePipe, FormField, FormRoot],
  templateUrl: './journal-page.html',
  styleUrl: './journal-page.css',
})
export class JournalPage {
  protected readonly commands = ROUTE_COMMANDS;


  readonly campaignContext = inject(CampaignContextService);
  private readonly journalService = inject(JournalService);
  private readonly summaryService = inject(SidebarSummaryService);
  private readonly confirmation = inject(ConfirmationService);
  readonly entries = signal<JournalEntry[]>([]);
  readonly isLoading = signal(false);
  readonly loadError = signal('');
  readonly saveError = signal('');
  readonly deleteError = signal('');
  readonly isDeleting = signal<string | null>(null);
  readonly showEditor = signal(false);
  readonly editingId = signal<string | null>(null);
  private readonly reloadToken = signal(0);
  readonly entryTypeOptions = JOURNAL_ENTRY_OPTIONS;

  // Permissions

  readonly canEdit = computed(() =>
    this.campaignContext.isDungeonMasterView() &&
    !!this.campaignContext.selectedId()
  );

  // Signal Forms

  readonly editorModel = signal<JournalFormModel>({
    ...EMPTY_JOURNAL
  });

  readonly journalForm = form(
    this.editorModel,
    (path) => {

      required(path.journalEntryType, {
        message: 'Seleccioná un tipo de entrada.'
      });

      required(path.description, {
        message: 'Escribí el acontecimiento.'
      });

      maxLength(path.description, 65535, {
        message: 'La descripción es demasiado larga.'
      });

    },
    {
      submission: {
        action: async () => {
          await this.saveEntry(this.editorModel());
        }
      }
    }
  );

  // Journal timeline

  readonly sortedEntries = computed<JournalEntry[]>(() =>
    [...this.entries()].sort(
      (a, b) => b.date.localeCompare(a.date)
    )
  );

  constructor() {

    // Reload entries when campaign changes

    effect((onCleanup) => {

      const campaignId = this.campaignContext.selectedId();
      const role = this.campaignContext.selectedRole();

      this.reloadToken();

      this.entries.set([]);
      this.loadError.set('');
      this.closeEditor();

      if (!campaignId || !role) {
        this.isLoading.set(false);
        return;
      }

      this.isLoading.set(true);

      const subscription = this.journalService
        .getByCampaign(campaignId)
        .subscribe({

          next: (entries: JournalEntry[]) => {
            this.entries.set(entries);
            this.isLoading.set(false);
          },

          error: (error: HttpErrorResponse) => {
            this.loadError.set(
              this.getErrorMessage(
                error,
                'No se pudo cargar el diario.'
              )
            );

            this.isLoading.set(false);
          }

        });

      onCleanup(() => subscription.unsubscribe());
    });
  }

  // Change selected campaign

  onCampaignChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const campaignId = select.value;

    if (campaignId === this.campaignContext.selectedId()) {
      return;
    }

    this.campaignContext.selectCampaign(campaignId);
  }

  // Reload entries

  reload(): void {
    this.reloadToken.update(value => value + 1);
  }

  // Create entry

  openCreate(): void {
    if (!this.canEdit()) {
      return;
    }

    this.editingId.set(null);
    this.saveError.set('');

    this.editorModel.set({
      ...EMPTY_JOURNAL
    });

    this.showEditor.set(true);
  }

  // Edit entry

  openEdit(entry: JournalEntry): void {
    if (!this.canEdit()) {
      return;
    }

    this.editingId.set(entry.publicId);
    this.saveError.set('');

    this.editorModel.set({
      journalEntryType: entry.journalEntryType,
      description: entry.description
    });

    this.showEditor.set(true);
  }

  // Close editor

  closeEditor(): void {
    this.showEditor.set(false);
    this.editingId.set(null);
    this.saveError.set('');

    this.editorModel.set({
      ...EMPTY_JOURNAL
    });
  }

  // Create or update entry

  async saveEntry(value: JournalFormModel): Promise<void> {

    const campaignId = this.campaignContext.selectedId();

    if (!campaignId || !this.canEdit()) {
      return;
    }

    const description = value.description.trim();

    if (!description) {
      this.saveError.set(
        'Escribí una descripción para continuar.'
      );
      return;
    }

    this.saveError.set('');

    const editingId = this.editingId();

    try {

      if (editingId) {

        await firstValueFrom(
          this.journalService.update(editingId, {
            journalEntryType: value.journalEntryType,
            description
          })
        );

      } else {

        await firstValueFrom(
          this.journalService.create({
            campaignId,
            journalEntryType: value.journalEntryType,
            description
          })
        );

      }

      this.closeEditor();

      this.summaryService.notifyJournalChanged();

      this.reload();

    } catch (error: unknown) {

      this.saveError.set(
        this.getErrorMessage(
          error,
          'No se pudo guardar la entrada.'
        )
      );

    }
  }

  // Delete entry

  async deleteEntry(entry: JournalEntry): Promise<void> {

    if (!this.canEdit() || this.isDeleting()) {
      return;
    }

    const confirmed = await this.confirmation.confirm({
      title: 'Eliminar entrada',
      message: '¿Querés eliminar esta entrada del diario? No se puede deshacer.',
      confirmLabel: 'Eliminar',
      danger: true,
    });

    if (!confirmed) {
      return;
    }

    this.deleteError.set('');
    this.isDeleting.set(entry.publicId);

    try {

      await firstValueFrom(
        this.journalService.delete(entry.publicId)
      );

      this.entries.update(
        (entries: JournalEntry[]) =>
          entries.filter(
            (item: JournalEntry) =>
              item.publicId !== entry.publicId
          )
      );

      this.summaryService.notifyJournalChanged();

    } catch (error: unknown) {

      this.deleteError.set(
        this.getErrorMessage(
          error,
          'No se pudo eliminar la entrada.'
        )
      );

    } finally {
      this.isDeleting.set(null);
    }
  }

  getTypeLabel(type: JournalEntryType): string {
    return this.entryTypeOptions.find(
      option => option.value === type
    )?.label ?? type;
  }

  // HTTP errors

  private getErrorMessage(
    error: unknown,
    fallback: string
  ): string {

    if (error instanceof HttpErrorResponse) {

      switch (error.status) {
        case 400:
          return 'Revisá los datos ingresados.';

        case 401:
          return 'Tu sesión expiró.';

        case 403:
          return 'No tenés permiso para realizar esta acción.';

        case 404:
          return 'No se encontró el recurso solicitado.';
      }

      if (error.status === 0) {
        return 'No se pudo conectar con el servidor.';
      }
    }

    return fallback;
  }
}
