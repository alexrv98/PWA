import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { API_CONFIG } from '../api.config';
import { AuthService } from './auth.service';
import { Habitacion, HabitacionAdmin } from '../models/habitaciones.model';

@Injectable({
  providedIn: 'root',
})
export class HabitacionesAdminService {
  private apiUrl = API_CONFIG.baseUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  obtenerHabitaciones(hotelId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/habitAdmin/listHabitaciones.php?hotel_id=${hotelId}`, { withCredentials: true }).pipe(
      catchError((error) => {
        console.error('Error al obtener habitaciones:', error);
        return throwError(() => new Error('Error al obtener las habitaciones.'));
      })
    );
  }
  
  agregarHabitacion(habitacion: HabitacionAdmin ): Observable<any> {
    return this.http.post(`${this.apiUrl}/habitAdmin/addHabitacion.php`, habitacion, { withCredentials: true }).pipe(
      catchError((error) => {
        console.error('Error al agregar habitación:', error);
        return throwError(() => new Error('Error al agregar la habitación.'));
      })
    );
  }
  
  obtenerTiposHabitacion(): Observable<any> {
    return this.http.get(`${this.apiUrl}/habitAdmin/listTiposHabitacion.php`).pipe(
      catchError((error) => {
        console.error('Error al obtener tipos de habitación:', error);
        return throwError(() => new Error('Error al obtener los tipos de habitación.'));
      })
    );
  }
  
  editarHabitacion(habitacion: HabitacionAdmin ): Observable<any> {
    return this.http.post(`${this.apiUrl}/habitAdmin/updateHabitacion.php`, habitacion, { withCredentials: true }).pipe(
      catchError((error) => {
        console.error('Error al editar habitación:', error);
        return throwError(() => new Error('Error al editar la habitación.'));
      })
    );
  }
  
  eliminarHabitacion(idHabitacion: number): Observable<any> {
    return this.http.request('DELETE', `${this.apiUrl}/habitAdmin/delete_habitacion.php`, {
      withCredentials: true,
      body: { id: idHabitacion },
    }).pipe(
      catchError((error) => {
        console.error('Error al eliminar la habitación:', error);
        return throwError(() => new Error('Error al eliminar la habitación.'));
      })
    );
  }
  

}
