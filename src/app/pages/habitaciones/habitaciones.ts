import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HabitacionService } from '../../services/habitacion.service';
import { AuthService } from '../../services/auth.service';
import { Habitacion } from '../../../models/habitacion.models';

@Component({
  selector: 'app-habitaciones',
  imports: [ReactiveFormsModule],
  templateUrl: './habitaciones.html',
  styleUrl: './habitaciones.scss',
})
export class Habitaciones implements OnInit {
  private habitacionService = inject(HabitacionService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  habitaciones = signal<Habitacion[]>([]);
  cargando = signal(true);
  mensajeError = signal('');
  nombreUsuario = signal('');
  esAdmin = signal(false);

  guardando = signal(false);
  errorFormulario = signal('');
  exitoFormulario = signal('');

  formulario = this.fb.nonNullable.group({
    numero: ['', [Validators.required, Validators.maxLength(10)]],
    tipo: ['SIMPLE', [Validators.required]],
    capacidad: [1, [Validators.required, Validators.min(1)]],
    precioNoche: [0, [Validators.required, Validators.min(0.01)]],
    estado: ['DISPONIBLE', [Validators.required]],
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

    this.habitacionService.listar().subscribe({
      next: (datos) => {
        this.habitaciones.set(datos);
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        if (err.status === 0) {
          this.mensajeError.set('No se pudo conectar con el servidor.');
        } else if (err.status === 401 || err.status === 403) {
          this.mensajeError.set('Tu sesión no es válida o no tienes permisos.');
        } else {
          this.mensajeError.set('Ocurrió un error al cargar las habitaciones.');
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

    this.habitacionService.crear(this.formulario.getRawValue()).subscribe({
      next: (creada) => {
        this.guardando.set(false);
        this.exitoFormulario.set(`Habitación ${creada.numero} registrada correctamente.`);
        this.formulario.reset({
          numero: '',
          tipo: 'SIMPLE',
          capacidad: 1,
          precioNoche: 0,
          estado: 'DISPONIBLE',
        });
        this.cargar();
      },
      error: (err) => {
        this.guardando.set(false);
        if (err.status === 0) {
          this.errorFormulario.set('No se pudo conectar con el servidor.');
        } else if (err.status === 403) {
          this.errorFormulario.set('No tienes permisos para registrar habitaciones.');
        } else if (err.status === 409) {
          this.errorFormulario.set('Ya existe una habitación con ese número.');
        } else if (err.status === 400) {
          this.errorFormulario.set('Los datos enviados no son válidos.');
        } else {
          this.errorFormulario.set('Ocurrió un error al registrar la habitación.');
        }
      },
    });
  }

  irAReservas(): void {
    this.router.navigate(['/reservas']);
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}