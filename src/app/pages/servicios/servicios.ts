import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ServicioService } from '../../services/servicio.service';
import { AuthService } from '../../services/auth.service';
import { Servicio } from '../../../models/servicio.models';

@Component({
  selector: 'app-servicios',
  imports: [ReactiveFormsModule],
  templateUrl: './servicios.html',
  styleUrl: './servicios.scss',
})
export class Servicios implements OnInit {
  private servicioService = inject(ServicioService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  servicios = signal<Servicio[]>([]);
  cargando = signal(true);
  mensajeError = signal('');
  nombreUsuario = signal('');
  esAdmin = signal(false);

  guardando = signal(false);
  errorFormulario = signal('');
  exitoFormulario = signal('');

  formulario = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    descripcion: ['', [Validators.maxLength(500)]],
    precio: [0, [Validators.required, Validators.min(0.01)]],
    activo: [true],
  });

  ngOnInit(): void {
    if (!this.authService.estaLogueado()) {
      this.router.navigate(['/login']);
      return;
    }
    this.nombreUsuario.set(this.authService.getUsuario()?.nombre ?? '');
    this.esAdmin.set(this.authService.esAdmin());
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.mensajeError.set('');

    this.servicioService.listar().subscribe({
      next: (datos) => {
        this.servicios.set(datos);
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        if (err.status === 0) {
          this.mensajeError.set('No se pudo conectar con el servidor.');
        } else if (err.status === 401 || err.status === 403) {
          this.mensajeError.set('Tu sesión no es válida o no tienes permisos.');
        } else {
          this.mensajeError.set('Ocurrió un error al cargar los servicios.');
        }
      },
    });
  }

  registrar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.errorFormulario.set('');
    this.exitoFormulario.set('');

    this.servicioService.crear(this.formulario.getRawValue()).subscribe({
      next: (creado) => {
        this.guardando.set(false);
        this.exitoFormulario.set(`Servicio "${creado.nombre}" registrado correctamente.`);
        this.formulario.reset({ nombre: '', descripcion: '', precio: 0, activo: true });
        this.cargar();
      },
      error: (err) => {
        this.guardando.set(false);
        if (err.status === 0) {
          this.errorFormulario.set('No se pudo conectar con el servidor.');
        } else if (err.status === 403) {
          this.errorFormulario.set('No tienes permisos para registrar servicios.');
        } else if (err.status === 409) {
          this.errorFormulario.set('Ya existe un servicio con ese nombre.');
        } else if (err.status === 400) {
          this.errorFormulario.set('Los datos enviados no son válidos.');
        } else {
          this.errorFormulario.set('Ocurrió un error al registrar el servicio.');
        }
      },
    });
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}