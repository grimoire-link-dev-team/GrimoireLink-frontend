import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { BackgroundCatalogItem, CatalogItem } from './character.model';
import { environment } from '../../../environments/environment';

@Service()
export class CatalogService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiURL}/catalog`;

  getRaces(): Observable<CatalogItem[]> {
    return this.http.get<CatalogItem[]>(`${this.apiUrl}/races`);
  }

  getClasses(): Observable<CatalogItem[]> {
    return this.http.get<CatalogItem[]>(`${this.apiUrl}/classes`);
  }

  getBackgrounds(): Observable<BackgroundCatalogItem[]> {
    return this.http.get<BackgroundCatalogItem[]>(`${this.apiUrl}/backgrounds`);
  }
}
