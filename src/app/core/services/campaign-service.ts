import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Campaign } from '../../pages/campaign/campaign';
import { Observable } from 'rxjs';

@Service()
export class CampaignService {

    private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/campaigns';

  getCampaigns(): Observable<Campaign[]> {
    return this.http.get<Campaign[]>(this.apiUrl);
  }

  getCampaignById(id: string): Observable<Campaign> {
    return this.http.get<Campaign>(`${this.apiUrl}/${id}`);
  }

}
