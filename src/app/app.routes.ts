import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Registro } from './pages/registro/registro';
import { Habitaciones } from './pages/habitaciones/habitaciones';
import { Reservas } from './pages/reservas/reservas';
import { Servicios } from './pages/servicios/servicios';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },
  { path: 'habitaciones', component: Habitaciones, canActivate: [authGuard] },
  { path: 'reservas', component: Reservas, canActivate: [authGuard] },
  { path: 'servicios', component: Servicios, canActivate: [authGuard] },
];