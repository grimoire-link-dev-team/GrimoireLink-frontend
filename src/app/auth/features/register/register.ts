import { Component, inject, signal } from '@angular/core';
import { email, form, FormField, FormRoot, minLength, required } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../data-access/auth-service';
import { HttpErrorResponse } from '@angular/common/http';
import { ROUTE_COMMANDS } from '../../../app.route.segments';

@Component({
  imports: [FormField, FormRoot, RouterLink],
  selector: 'app-register',
  styleUrl: './register.css',
  templateUrl: './register.html',
})
export class Register {
  protected readonly commands = ROUTE_COMMANDS;


  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  errorMessage = signal('');

  registerModel = signal({
    name: '',
    email: '',
    password: ''
  });

  registerForm = form(
    this.registerModel,
    (path) => {
      required(path.name, {
        message: 'Ingresá tu nombre'
      });

      minLength(path.name, 3, {
        message: 'El nombre debe tener al menos 3 caracteres'
      });

      required(path.email, {
        message: 'Ingresá tu correo'
      });

      email(path.email, {
        message: 'El correo no es válido'
      });

      required(path.password, {
        message: 'Ingresá tu contraseña'
      });

      minLength(path.password, 8, {
        message: 'La contraseña debe tener al menos 8 caracteres'
      });
    },
    {
      submission: {
        action: async (field) => {
          this.errorMessage.set('');

          const data = field().value();

          try {
            await this.authService.register(data);
            await this.router.navigate(ROUTE_COMMANDS.home);
          } catch (error) {
            this.errorMessage.set(this.getErrorMessage(error));
          }
        }
      }
    }
  );

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 409) {
        return 'El correo ya está registrado';
      }

      if (error.status === 400) {
        return 'Revisá los datos ingresados';
      }

      if (error.status === 0) {
        return 'No se pudo conectar con el servidor';
      }
    }

    return 'Ocurrió un error. Intentá nuevamente';
  }
}
