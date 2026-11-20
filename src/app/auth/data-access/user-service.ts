import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../../environments/environment';
import { UserResponse } from './auth.model';
import { Observable } from 'rxjs';

@Service()
export class UserService {

      private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiURL}/users`;

  getCurrentUser(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/me`);
  }
}
