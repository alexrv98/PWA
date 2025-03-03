export interface Habitacion {
    habitacion_id: number;
    numero_habitacion: string;
    tipo_habitacion: string;
    capacidad: number;
    camas: number;
    precio_base: number;
    precio_calculado: number;
    precio_total: number;
    mensaje?: string;
    extras?: string;
    ninosExtras?: number;
    adultosExtras?: number;
    costoFinalAdultos?: number;
    costoFinalNinos?: number;
    extrasTotal?: number;
  }
  
  export interface RespuestaHabitaciones {
    status: 'success' | 'error';
    mensaje_busqueda?: string;
    habitacionesExactas: Habitacion[];
    otrasHabitaciones: Habitacion[];
    fechaInicio?: string;
    fechaFin?: string;
  }
  
export interface HabitacionAdmin {
  id: number;
  numero_habitacion: string;
  precio: number;
  tipo_habitacion_id: number;
  tipo_nombre: string;
  capacidad: number;
  camas: number;
}

export interface TipoHabitacion {
  id: number;
  nombre: string;
  capacidad: number;
  camas: number;
}


export interface ApiResponse<T> {
  status: string;
  message?: string;
  data: T;
}
