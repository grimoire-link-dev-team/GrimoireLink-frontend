import { HttpClient } from '@angular/common/http';
import { computed, inject, Service, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, UserResponse } from './auth.model';

@Service()
export class AuthService {
  private http = inject(HttpClient);
  private url = `${environment.apiURL}/auth`;
  private accessToken = signal<string | null>(localStorage.getItem('accessToken'));

  isAuthenticated = computed(() => this.accessToken() !== null);

  async register(data: RegisterRequest) {
    await firstValueFrom(this.http.post<UserResponse>(`${this.url}/register`, data));
    await this.login({ username: data.email, password: data.password });
  }

  async login(data: LoginRequest) {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>(`${this.url}/login`, data),
    );
    localStorage.setItem('accessToken', res.accessToken);
    localStorage.setItem('refreshToken', res.refreshToken);
    this.accessToken.set(res.accessToken);
  }

  getToken() {
    return this.accessToken();
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.accessToken.set(null);
  }
}