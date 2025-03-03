import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { API_CONFIG } from '../api.config';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ReservaService {
  private apiUrl = API_CONFIG.baseUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  realizarReserva(datosReserva: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reservaciones/reservar_con_cuenta.php`, datosReserva, { withCredentials: true })
      .pipe(
        catchError((error) => {
          console.error('Error en la reserva:', error);
          return throwError(() => error);
        })
      );
  }
  
  obtenerReservacionesUsuario(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reservaciones/listreservacionesusuario.php`, { withCredentials: true })
      .pipe(
        catchError((error) => {
          console.error('Error al obtener reservaciones:', error);
          return throwError(() => new Error('Error al obtener reservaciones.'));
        })
      );
  }
  
  obtenerReservacionesAdmin(): Observable<any> {
    return this.http.post(`${this.apiUrl}/reservaciones/listaReservasHoteles.php`, {}, { withCredentials: true })
      .pipe(
        catchError((error) => {
          console.error('Error al obtener reservaciones del hotel:', error);
          return throwError(() => new Error('Error al obtener las reservaciones.'));
        })
      );
  }  

  realizarPago(datosPago: any): Observable<any> {
    return this.http.post<any>('http://192.168.1.102/sistemaExam/procesar_pago.php', datosPago);
  }

  cancelarReserva(idReserva: number): Observable<any> {
    return this.http.post<any>('http://192.168.1.102/sistemaExam/cancelar_reserva.php', { id: idReserva });
  }
  
  
  
}
