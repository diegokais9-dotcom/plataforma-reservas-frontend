import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Reserva, ReservaRequest } from '../../models/reserva.models';

@Injectable({ providedIn: 'root' })
export class ReservaService {
  private readonly baseUrl = `${environment.apiUrl}/reservas`;

  constructor(private http: HttpClient) {}

  crear(datos: ReservaRequest): Observable<Reserva> {
    return this.http.post<Reserva>(this.baseUrl, datos);
  }

  misReservas(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.baseUrl}/mis-reservas`);
  }

  cancelar(id: number): Observable<Reserva> {
    return this.http.put<Reserva>(`${this.baseUrl}/${id}/cancelar`, {});
  }
}