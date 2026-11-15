import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReservaService } from '../../services/reserva.service';
import { HabitacionService } from '../../services/habitacion.service';
import { AuthService } from '../../services/auth.service';
import { Reserva } from '../../../models/reserva.models';
import { Habitacion } from '../../../models/habitacion.models';

@Component({
  selector: 'app-reservas',
  imports: [ReactiveFormsModule],
  templateUrl: './reservas.html',
  styleUrl: './reservas.scss',
})
export class Reservas implements OnInit {
  private reservaService = inject(ReservaService);
  private habitacionService = inject(HabitacionService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  habitaciones = signal<Habitacion[]>([]);
  reservas = signal<Reserva[]>([]);
  cargando = signal(true);
  mensajeError = signal('');
  nombreUsuario = signal('');

  guardando = signal(false);
  errorFormulario = signal('');
  exitoFormulario = signal('');

  formulario = this.fb.nonNullable.group({
    habitacionId: [0, [Validators.min(1)]],
    fechaEntrada: ['', [Validators.required]],
    fechaSalida: ['', [Validators.required]],
  });

  ngOnInit(): void {
    if (!this.authService.estaLogueado()) {
      this.router.navigate(['/login']);
      return;
    }
    this.nombreUsuario.set(this.authService.getUsuario()?.nombre ?? '');
    this.cargarHabitaciones();
    this.cargarReservas();
  }

  cargarHabitaciones(): void {
    this.habitacionService.listar().subscribe({
      next: (datos) =>
        this.habitaciones.set(datos.filter((h) => h.estado !== 'MANTENIMIENTO')),
      error: () => this.mensajeError.set('No se pudieron cargar las habitaciones.'),
    });
  }

  cargarReservas(): void {
    this.cargando.set(true);
    this.mensajeError.set('');

    this.reservaService.misReservas().subscribe({
      next: (datos) => {
        this.reservas.set(datos);
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        if (err.status === 0) {
          this.mensajeError.set('No se pudo conectar con el servidor.');
        } else if (err.status === 401 || err.status === 403) {
          this.mensajeError.set('Tu sesión no es válida o no tienes permisos.');
        } else {
          this.mensajeError.set('Ocurrió un error al cargar tus reservas.');
        }
      },
    });
  }

  reservar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const datos = this.formulario.getRawValue();

    if (datos.fechaSalida <= datos.fechaEntrada) {
      this.errorFormulario.set('La fecha de salida debe ser posterior a la de entrada.');
      this.exitoFormulario.set('');
      return;
    }

    this.guardando.set(true);
    this.errorFormulario.set('');
    this.exitoFormulario.set('');

    this.reservaService.crear(datos).subscribe({
      next: (creada) => {
        this.guardando.set(false);
        this.exitoFormulario.set(
          `Reserva registrada. Habitación ${creada.habitacionNumero}, total S/ ${creada.total}.`
        );
        this.formulario.reset({ habitacionId: 0, fechaEntrada: '', fechaSalida: '' });
        this.cargarReservas();
      },
      error: (err) => {
        this.guardando.set(false);
        if (err.status === 0) {
          this.errorFormulario.set('No se pudo conectar con el servidor.');
        } else if (err.status === 409) {
          this.errorFormulario.set('La habitación no está disponible en esas fechas.');
        } else if (err.status === 400) {
          this.errorFormulario.set('Los datos enviados no son válidos. Revisa las fechas.');
        } else if (err.status === 401 || err.status === 403) {
          this.errorFormulario.set('Tu sesión no es válida o no tienes permisos.');
        } else {
          this.errorFormulario.set('Ocurrió un error al registrar la reserva.');
        }
      },
    });
  }

  cancelar(id: number): void {
    this.mensajeError.set('');
    this.reservaService.cancelar(id).subscribe({
      next: () => this.cargarReservas(),
      error: () => this.mensajeError.set('No se pudo cancelar la reserva.'),
    });
  }

  irAHabitaciones(): void {
    this.router.navigate(['/habitaciones']);
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}