import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, UserResponse } from './auth.model';

@Service()
export class AuthService {
  private http = inject(HttpClient);
  private url = `${environment.apiURL}/auth`;

  register(data: RegisterRequest) {
    return this.http.post<UserResponse>(`${this.url}/register`, data);
  }

  login(data: LoginRequest) {
    return this.http.post<AuthResponse>(`${this.url}/login`, data);
  }
}
