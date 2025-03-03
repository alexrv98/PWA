import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { API_CONFIG } from '../api.config';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class HotelService {
  private apiUrl = API_CONFIG.baseUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  obtenerHotelesDisponibles(filtros: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/hoteles/buscarHoteles.php`, filtros);  
  }

  obtenerHoteles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/hoteles/listHoteles.php`, { withCredentials: true }).pipe(
      catchError((error) => {
        console.error('Error al obtener hoteles:', error);
        return throwError(() => new Error('Error al obtener los hoteles.'));
      })
    );
  }
  
}
