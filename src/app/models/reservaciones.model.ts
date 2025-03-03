export interface Reservacion {
    reservacion_id: number;
    numero_habitacion: string;
    tipo_habitacion: string;
    capacidad: number;
    camas: number;
    precio: number;
    fecha_inicio: string;
    fecha_fin: string;
    estado: string;
    total_a_pagar: number;
    total_dias_hospedaje: number;
    hotel_id: number;
    nombre_hotel: string;
    nombre_lugar_turistico: string;
    nombre_usuario: string;
    correo_usuario: string;
  }
  
  export interface RespuestaReservaciones {
    status: 'success' | 'error';
    message?: string;
    data: Reservacion[];
  }
  