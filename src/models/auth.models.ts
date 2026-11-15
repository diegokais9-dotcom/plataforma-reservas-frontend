export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface JwtResponse {
  token: string;
  tipo: string;
  id: number;
  email: string;
  nombre: string;
  roles: string[];
}