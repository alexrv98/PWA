import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_CONFIG } from '../api.config';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = API_CONFIG.baseUrl;

  constructor(private http: HttpClient) {}

  login(correo: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login.php`, { correo, password }, { withCredentials: true });
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register.php`, data, { withCredentials: true });
  }
  
  estaAutenticado(): Observable<boolean> {
    return this.http.get<any>(`${this.apiUrl}/auth/verificar_sesion.php`, { withCredentials: true }).pipe(
      map(response => response.status === 'success') 
    );
  }

  logout(): void {
    this.http.get(`${this.apiUrl}/auth/logout.php`, { withCredentials: true }).subscribe();
  }

  obtenerUsuarioLogueado(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/auth/usuario.php`, { withCredentials: true });
  }
}
