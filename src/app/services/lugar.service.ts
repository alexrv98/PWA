import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';

@Injectable({
  providedIn: 'root',
})
export class LugarService {
  private baseUrl = API_CONFIG.baseUrl;

  constructor(private http: HttpClient) {}

  obtenerLugares(categoria_id?: number): Observable<any> {
    let url = `${this.baseUrl}/lugares/listLugaresTuristicos.php`;
    if (categoria_id) {
      url += `?categoria_id=${categoria_id}`;
    }
    return this.http.get(url);
  }

  obtenerDestinoPorId(destinoId: number): Observable<any> {
    const url = `${this.baseUrl}/lugares/getDestinoPorId.php?id=${destinoId}`;
    return this.http.get(url);
  }

  obtenerCategorias(): Observable<any> {
    return this.http.get(`${this.baseUrl}/lugares/categorias.php`);
  }
}
