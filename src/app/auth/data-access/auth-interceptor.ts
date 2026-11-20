import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth-service';
import { environment } from '../../../environments/environment';
import { ROUTE_COMMANDS } from '../../app.route.segments';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  const isApiRequest = req.url.startsWith(`${environment.apiURL}/`);
  const isAuthRequest = req.url.startsWith(`${environment.apiURL}/auth/`);

  if (!isApiRequest || isAuthRequest) {
    return next(req);
  }

  const request = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
        router.navigate(ROUTE_COMMANDS.login);
      }
      return throwError(() => error);
    }),
  );
};