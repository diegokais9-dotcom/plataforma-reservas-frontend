import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  cargando = signal(false);
  mensajeError = signal('');
  mensajeExito = signal('');

  formulario = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  enviar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.mensajeError.set('');
    this.mensajeExito.set('');

    this.authService.login(this.formulario.getRawValue()).subscribe({
      next: (respuesta) => {
        this.cargando.set(false);
        this.mensajeExito.set(`Sesión iniciada como ${respuesta.nombre}`);
        this.router.navigate(['/habitaciones']);
      },
      error: (err) => {
        this.cargando.set(false);
        if (err.status === 0) {
          this.mensajeError.set('No se pudo conectar con el servidor.');
        } else if (err.status === 401) {
          this.mensajeError.set('Email o contraseña incorrectos.');
        } else {
          this.mensajeError.set('Ocurrió un error inesperado. Intenta de nuevo.');
        }
      },
    });
  }
}