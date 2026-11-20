import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SidebarJournalEntry {
  publicId: string;
  journalEntryType: string;
  date: string;
  description: string;
}

export interface SidebarCharacter {
  publicId: string;
  name: string;
  characterClass: string;
  level: number;
}

@Injectable({
  providedIn: 'root'
})
export class SidebarSummaryService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiURL;

  // Journal change notification

  private readonly journalChangeCount = signal(0);

  readonly journalChanged =
    this.journalChangeCount.asReadonly();

  notifyJournalChanged(): void {
    this.journalChangeCount.update(value => value + 1);
  }

  // Journal requests

  getJournals(campaignId: string): Observable<SidebarJournalEntry[]> {
    return this.http.get<SidebarJournalEntry[]>(
      `${this.apiUrl}/journals`,
      {
        params: {
          campaignPublicId: campaignId
        }
      }
    );
  }

  // Character requests

  getCharacters(campaignId: string): Observable<SidebarCharacter[]> {
    return this.http.get<SidebarCharacter[]>(
      `${this.apiUrl}/characters`,
      {
        params: {
          campaignId
        }
      }
    );
  }
}
