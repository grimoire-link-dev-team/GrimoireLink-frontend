
import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { AddItemRequest, CharacterCreateRequest, CharacterResponse } from './character.model';
import { environment } from '../../../environments/environment';

@Service()
export class CharacterService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiURL}/characters`;

  // The backend does not delete characters: DELETE marks them as DEAD.
  markAsDead(characterId: string) {
    return this.http.delete<void>(`${this.apiUrl}/${characterId}`);
  }

  getByCampaign(campaignId: string): Observable<CharacterResponse[]> {
    return this.http.get<CharacterResponse[]>(this.apiUrl, { params: { campaignId } });
  }

  getById(characterId: string,campaignId: string): Observable<CharacterResponse> {
    return this.http.get<CharacterResponse>(`${this.apiUrl}/${characterId}`,
        {params: {campaignPublicId: campaignId}});
  }

  create(request: CharacterCreateRequest, campaignId: string): Observable<CharacterResponse> {
    return this.http.post<CharacterResponse>(this.apiUrl, request,
        {params: {campaignId}});
  }

  updateGold(characterId: string, newGold: number): Observable<CharacterResponse> {
    return this.http.patch<CharacterResponse>(`${this.apiUrl}/${characterId}/gold`, null,
        {params: {newGold}});
  }

  // Hechizos

  addSpell(characterId: string, spellIndex: string): Observable<CharacterResponse> {
    return this.http.post<CharacterResponse>(`${this.apiUrl}/${characterId}/spell`, {spellIndex});
  }

  removeSpell(characterId: string, spellId: string): Observable<CharacterResponse> {
    return this.http.delete<CharacterResponse>(`${this.apiUrl}/${characterId}/spell/${spellId}`);
  }

  togglePreparedSpell(characterId: string, spellId: string): Observable<CharacterResponse> {
    return this.http.patch<CharacterResponse>(`${this.apiUrl}/${characterId}/spells/${spellId}/prepare`, null);
  }

  // Inventario

  addItem(characterId: string, request: AddItemRequest): Observable<CharacterResponse> {
    return this.http.post<CharacterResponse>(`${this.apiUrl}/${characterId}/items`, request);
  }

  removeItem(characterId: string, itemId: string): Observable<CharacterResponse> {
    return this.http.delete<CharacterResponse>(`${this.apiUrl}/${characterId}/items/${itemId}`);
  }

  toggleEquippedItem(characterId: string, itemId: string): Observable<CharacterResponse> {
    return this.http.patch<CharacterResponse>(`${this.apiUrl}/${characterId}/items/${itemId}/equip`, null);
  }

}
