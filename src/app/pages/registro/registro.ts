import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule],
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
})
export class Registro {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  guardando = signal(false);
  mensajeError = signal('');
  mensajeExito = signal('');

  formulario = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
  });

  registrar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const datos = this.formulario.getRawValue();

    if (datos.password !== datos.confirmPassword) {
      this.mensajeError.set('Las contraseñas no coinciden.');
      this.mensajeExito.set('');
      return;
    }

    this.guardando.set(true);
    this.mensajeError.set('');
    this.mensajeExito.set('');

    this.authService.register(datos).subscribe({
      next: () => {
        this.guardando.set(false);
        this.mensajeExito.set('Usuario registrado correctamente. Ya puedes iniciar sesión.');
        this.formulario.reset({ nombre: '', email: '', password: '', confirmPassword: '' });
      },
      error: (err) => {
        this.guardando.set(false);
        if (err.status === 0) {
          this.mensajeError.set('No se pudo conectar con el servidor.');
        } else if (err.status === 400 && err.error?.error) {
          this.mensajeError.set(err.error.error);
        } else {
          this.mensajeError.set('Ocurrió un error al registrar el usuario.');
        }
      },
    });
  }

  irALogin(): void {
    this.router.navigate(['/login']);
  }
}