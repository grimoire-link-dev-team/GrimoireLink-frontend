import { Component, inject } from '@angular/core';
import { AuthService } from '../../../auth/data-access/auth-service';
import { HomePublic } from '../home-public/home-public';

@Component({
  imports: [HomePublic],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {
  readonly isAuthenticated = inject(AuthService).isAuthenticated;

}
