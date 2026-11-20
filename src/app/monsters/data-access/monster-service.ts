import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Service } from '@angular/core';
import { environment } from '../../../environments/environment';
import { MonsterCatalogDetail, MonsterReference } from './monster.model';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class MonsterService {


  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiURL}/monster`;

  getMonsters(): Observable<MonsterReference[]> {
    return this.http.get<MonsterReference[]>(
      `${this.apiUrl}/catalog`
    );
  }

  getMonsterFromApi(index: string): Observable<MonsterCatalogDetail> {
    return this.http.get<MonsterCatalogDetail>(
      `${this.apiUrl}/api/${encodeURIComponent(index)}`
    );
  }

}
