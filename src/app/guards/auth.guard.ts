import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.authService.obtenerUsuarioLogueado().pipe(
      map((response) => {
        //console.log('Respuesta del guard:', response);  

        if (response.status === 'success') {
          const userRole = response.rol; 

          if ((state.url.startsWith('/admin') || state.url.startsWith('/reservaciones-admin')) && userRole !== 'admin') {
            console.log('Acceso denegado. El rol no es admin');
            this.router.navigate(['/']);
            return false;
          }

          return true;
        } else {
          console.log('No autenticado, redirigiendo...');
          this.router.navigate(['/']);
          return false;
        }
      }),
      catchError((error) => {
        console.error('Error al verificar usuario en canActivate:', error);
        this.router.navigate(['/']);
        return of(false);
      })
    );
  }
}
