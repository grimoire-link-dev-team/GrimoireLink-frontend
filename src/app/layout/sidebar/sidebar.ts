import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CampaignContextService } from '../../campaigns/data-access/campaign-context-service';
import { Campaign } from '../../campaigns/data-access/campaign.model';
import { catchError, forkJoin, of } from 'rxjs';
import { SidebarCharacter, SidebarJournalEntry, SidebarSummaryService } from '../data-access/sidebar-summary-service';
import { DatePipe } from '@angular/common';

type ViewMode='Dungeon Master'| 'Player';

@Component({
  imports: [RouterLink, RouterLinkActive, DatePipe],
  selector: 'app-sidebar',
  styleUrl: './sidebar.css',
  templateUrl: './sidebar.html',
})
export class Sidebar implements OnInit{

  readonly campaignContext = inject(CampaignContextService);

  private readonly summaryService = inject(SidebarSummaryService);

  readonly latestJournal = signal<SidebarJournalEntry | null>(null);
  readonly characters = signal<SidebarCharacter[]>([]);

  readonly summaryLoading = signal(false);
  readonly journalUnavailable = signal(false);
  readonly charactersUnavailable = signal(false);

  constructor() {
    effect((onCleanup) => {
      const campaignId = this.campaignContext.selectedId();
      const role = this.campaignContext.selectedRole();

      // Refresh summaries after journal changes

      this.summaryService.journalChanged();

      this.latestJournal.set(null);
      this.characters.set([]);

      this.journalUnavailable.set(false);
      this.charactersUnavailable.set(false);

      if (!campaignId || !role) {
        this.summaryLoading.set(false);
        return;
      }

      this.summaryLoading.set(true);

      const subscription = forkJoin({
        journals: this.summaryService.getJournals(campaignId).pipe(
          catchError(() => {
            this.journalUnavailable.set(true);
            return of([] as SidebarJournalEntry[]);
          })
        ),

        characters: this.summaryService.getCharacters(campaignId).pipe(
          catchError(() => {
            this.charactersUnavailable.set(true);
            return of([] as SidebarCharacter[]);
          })
        )
      }).subscribe({
        next: ({ journals, characters }) => {
          const sortedEntries = [...journals].sort(
            (a, b) => b.date.localeCompare(a.date)
          );

          this.latestJournal.set(sortedEntries[0] ?? null);
          this.characters.set(characters);

          this.summaryLoading.set(false);
        }
      });

      onCleanup(() => subscription.unsubscribe());
    });
  }

  ngOnInit(): void {
    this.campaignContext.load();
  }

  changeView(): void {
    this.campaignContext.changeView();
  }

  getStatusLabel(status: Campaign['status']): string {
    switch (status) {
      case 'ACTIVE':
        return 'Activa';
      case 'PAUSED':
        return 'Pausada';
      case 'FINISHED':
        return 'Finalizada';
      default:
        return 'Desconocido';
    }
  }
}
