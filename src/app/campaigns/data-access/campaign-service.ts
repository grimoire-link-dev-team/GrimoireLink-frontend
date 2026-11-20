import { HttpClient } from '@angular/common/http';
import { inject, Injectable} from '@angular/core';
import { Observable } from 'rxjs';
import { Campaign, CampaignMember, CampaignRequest } from './campaign.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CampaignService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiURL}/campaigns`;

  getCampaigns(): Observable<Campaign[]> {
    return this.http.get<Campaign[]>(this.apiUrl);
  }

  getCampaignById(id: string): Observable<Campaign> {
    return this.http.get<Campaign>(
      `${this.apiUrl}/${id}`
    );
  }

  createCampaign(data: CampaignRequest): Observable<Campaign> {
    return this.http.post<Campaign>(
      this.apiUrl,
      data
    );
  }

  getCampaignMembers(id: string): Observable<CampaignMember[]> {
    return this.http.get<CampaignMember[]>(
      `${this.apiUrl}/${id}/members`
    );
  }

  updateCampaignStatus(
    id: string,
    status: Campaign['status']
  ): Observable<Campaign> {
    return this.http.patch<Campaign>(
      `${this.apiUrl}/${id}`,
      { status }
    );
  }

  joinCampaign(inviteCode: string): Observable<Campaign> {
    return this.http.post<Campaign>(
      `${this.apiUrl}/join`,
      null,
      {
        params: { inviteCode }
      }
    );
  }

}
