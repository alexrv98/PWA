import { Component, Input, OnDestroy } from '@angular/core';
import { ActivatedRoute, Route, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { OnInit } from '@angular/core';
import { ReservaService } from '../../services/reserva.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  imports: [RouterLink, CommonModule],
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit, OnDestroy {
  isAuthenticated: boolean = false;
  nombreUsuario: string = '';
  rolUsuario: string | null = null;

  private unsubscribe$ = new Subject<void>();

  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute, private reservacionesService: ReservaService) { }

  hotelId!: number;

  ngOnInit(): void {
    this.authService.estaAutenticado().pipe(
      takeUntil(this.unsubscribe$) 
    ).subscribe((isAuthenticated) => {
      this.isAuthenticated = isAuthenticated;
  
      if (isAuthenticated) {
        this.authService.obtenerUsuarioLogueado().pipe(
          takeUntil(this.unsubscribe$)
        ).subscribe({
          next: (response) => {
            if (response.status === 'success') {
              this.nombreUsuario = response.nombre;  
              this.rolUsuario = response.rol;
            } else {
              console.error('Error al obtener usuario');
            }
          },
          error: (error) => {
            console.error('Error al obtener los datos del usuario:', error);
          },
        });
      }
    });
  }
  

  logout(): void {
    this.authService.logout();
    console.log('Sesión cerrada correctamente');
    this.router.navigate(['/']).then(() => {
      if (this.router.url === '/') {
        window.location.reload();
      }
    });
  }

  verReservaciones(): void {
    if (!this.hotelId) {
      console.error('Este administrador no tiene un hotel asignado.');
      return;
    }

    console.log('hotelId disponible:', this.hotelId);

    this.router.navigate(['/reservaciones-admin']);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(); 
    this.unsubscribe$.complete(); 
  }
}
