import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../navbar/navbar.component';
import { FooterComponent } from '../../footer/footer.component';
import { ReservaService } from '../../../services/reserva.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-misreservas',
  imports: [
    CommonModule,
    FormsModule,
    NavbarComponent,
    FooterComponent
  ],
  templateUrl: './mis-reservas.component.html',
  styleUrl: './mis-reservas.component.css',
})


export class MisReservasComponent implements OnInit, OnDestroy {
  estaAutenticado: boolean = false;
  reservaciones: any[] = [];
  isLoading: boolean = true;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private reservaService: ReservaService,
    private router: Router 
  ) {}

  ngOnInit(): void {
    this.verificarUsuario();
  }


  verificarUsuario(): void {
    this.authService.obtenerUsuarioLogueado().pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: (response) => {
        if (response.status === 'success' && response.nombre) {
          this.estaAutenticado = true;
          this.cargarReservaciones();
        } else {
          this.estaAutenticado = false;
          console.warn('Usuario no autenticado: respuesta inválida del servidor');
        }
      },
      error: (error) => {
        this.estaAutenticado = false;
        console.error('Error al verificar usuario:', error);
      },
    });
  }  
  

  cargarReservaciones(): void {
    this.isLoading = true;
    this.reservaService.obtenerReservacionesUsuario().pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: (response) => {
        if (response.status === 'success' && Array.isArray(response.data)) {
          this.reservaciones = response.data;
        } else {
          console.warn('No se encontraron reservas o formato incorrecto.');
          this.reservaciones = [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al obtener reservas:', error);
        this.reservaciones = [];
        this.isLoading = false;
      },
    });
  }

  irAComentarios(reservacion: any): void {
    this.router.navigate(['/comentarios/:hotelId'], {
      queryParams: {
        hotel_id: reservacion.hotel_id,
        habitacion_id: reservacion.habitacion_id,
        usuario_id: reservacion.usuario_id,
      },
    });
  }
  
  
  cancelarReserva(reservacion: any) {
    if (!confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      return;
    }
  
    console.log('Intentando cancelar la reserva:', reservacion);
  
    const idReserva = reservacion.id || reservacion.reservacion_id;
  
    if (!idReserva) {
      console.error('Error: ID de la reserva es undefined o null');
      alert('No se pudo obtener el ID de la reserva. Revisa la consola.');
      return;
    }
  
    this.reservaService.cancelarReserva(idReserva).subscribe({
      next: (response) => {
        console.log('Respuesta de la API:', response);
  
        if (response.status === 'success') {
          alert('Reserva cancelada y reembolso en proceso.');
          this.cargarReservaciones(); 
        } else {
          alert('Error al cancelar la reserva: ' + response.message);
        }
      },
      error: (error) => {
        console.error('Error al cancelar la reserva:', error);
        alert('Ocurrió un error al procesar la cancelación. Revisa la consola.');
      }
    });
  }
  
  
  
  ngOnDestroy() {
    this.unsubscribe$.next(); 
    this.unsubscribe$.complete();  
  }

}
