export interface ReservaRequest {
  habitacionId: number;
  fechaEntrada: string;
  fechaSalida: string;
}

export interface Reserva {
  id: number;
  usuarioId: number;
  usuarioNombre: string;
  habitacionId: number;
  habitacionNumero: string;
  habitacionTipo: string;
  fechaEntrada: string;
  fechaSalida: string;
  estado: string;
  total: number;
}