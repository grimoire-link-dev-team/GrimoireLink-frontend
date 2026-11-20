import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  JournalEntry,
  JournalRequest,
  UpdateJournalRequest
} from './journal.model';

@Injectable({
  providedIn: 'root'
})
export class JournalService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiURL}/journals`;

  getByCampaign(
    campaignId: string
  ): Observable<JournalEntry[]> {
    return this.http.get<JournalEntry[]>(
      this.apiUrl,
      {
        params: {
          campaignPublicId: campaignId
        }
      }
    );
  }

  getById(publicId: string): Observable<JournalEntry> {
    return this.http.get<JournalEntry>(
      `${this.apiUrl}/${publicId}`
    );
  }

  create(
    request: JournalRequest
  ): Observable<JournalEntry> {
    return this.http.post<JournalEntry>(
      this.apiUrl,
      request
    );
  }

  update(
    publicId: string,
    request: UpdateJournalRequest
  ): Observable<JournalEntry> {
    return this.http.patch<JournalEntry>(
      `${this.apiUrl}/${publicId}`,
      request
    );
  }

  delete(publicId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${publicId}`
    );
  }
}
