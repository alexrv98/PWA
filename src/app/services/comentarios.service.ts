import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_CONFIG } from '../api.config';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ComentariosService {
  private apiUrl = API_CONFIG.baseUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  agregarComentario(hotel_id: number, calificacion: number, comentario: string, usuario_id: number): Observable<any> {
    const body = {
      hotel_id,
      calificacion,
      comentario,
      usuario_id,
    };
  
    return this.http.post(`${this.apiUrl}/comentarios/comentarios.php`, body, { withCredentials: true });
  }
  
  getComentarios(hotel_id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/comentarios/comentarios.php?hotel_id=${hotel_id}`);
  }
  
  getReservaciones(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/comentarios/comentReserva.php`, { withCredentials: true });
  }
  

}
