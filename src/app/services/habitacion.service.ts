import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Habitacion } from '../../models/habitacion.models';

@Injectable({ providedIn: 'root' })
export class HabitacionService {
  private readonly baseUrl = `${environment.apiUrl}/habitaciones`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Habitacion[]> {
    return this.http.get<Habitacion[]>(this.baseUrl);
  }

  crear(habitacion: Omit<Habitacion, 'id'>): Observable<Habitacion> {
    return this.http.post<Habitacion>(this.baseUrl, habitacion);
  }
}