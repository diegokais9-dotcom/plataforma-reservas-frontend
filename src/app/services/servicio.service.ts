import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Servicio, ServicioRequest } from '../../models/servicio.models';

@Injectable({ providedIn: 'root' })
export class ServicioService {
  private readonly baseUrl = `${environment.apiUrl}/servicios`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Servicio[]> {
    return this.http.get<Servicio[]>(this.baseUrl);
  }

  crear(datos: ServicioRequest): Observable<Servicio> {
    return this.http.post<Servicio>(this.baseUrl, datos);
  }
}