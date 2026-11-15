import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { JwtResponse, LoginRequest, RegisterRequest } from '../../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = `${environment.apiUrl}/auth`;
  private readonly tokenKey = 'token';
  private readonly userKey = 'usuario';

  constructor(private http: HttpClient) {}

  login(datos: LoginRequest): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(`${this.baseUrl}/login`, datos).pipe(
      tap((respuesta) => {
        localStorage.setItem(this.tokenKey, respuesta.token);
        localStorage.setItem(this.userKey, JSON.stringify(respuesta));
      })
    );
  }

  register(datos: RegisterRequest): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/register`, datos);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUsuario(): JwtResponse | null {
    const guardado = localStorage.getItem(this.userKey);
    return guardado ? (JSON.parse(guardado) as JwtResponse) : null;
  }

  estaLogueado(): boolean {
    return this.getToken() !== null;
  }

  esAdmin(): boolean {
    return this.getUsuario()?.roles.includes('ROLE_ADMIN') ?? false;
  }
}