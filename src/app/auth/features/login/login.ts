import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { email, form, FormField, FormRoot, required } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../data-access/auth-service';

@Component({
  imports: [FormField, FormRoot, RouterLink],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);

  errorMessage = signal('');
  loginModel = signal({ email: '', password: '' });

  loginForm = form(
    this.loginModel,
    (path) => {
      required(path.email, { message: 'Ingresá tu correo' });
      email(path.email, { message: 'El correo no es válido' });
      required(path.password, { message: 'Ingresá tu contraseña' });
    },
    {
      submission: {
        action: async (field) => {
          this.errorMessage.set('');
          const value = field().value();
          try {
            await this.auth.login({ username: value.email, password: value.password });
            await this.router.navigateByUrl('/inicio');
          } catch (error) {
            this.errorMessage.set(this.getErrorMessage(error));
          }
        },
      },
    },
  );

  private getErrorMessage(error: unknown) {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401 || error.status === 403) return 'Correo o contraseña incorrectos';
      if (error.status === 0) return 'No se pudo conectar con el servidor';
    }
    return 'Ocurrió un error, intentá de nuevo';
  }
}
