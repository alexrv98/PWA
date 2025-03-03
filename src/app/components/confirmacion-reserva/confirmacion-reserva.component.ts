import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReservaService } from '../../services/reserva.service';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { AuthService } from '../../services/auth.service';
import { take } from 'rxjs/operators';
import { OpenpayComponent } from '../openpay/openpay.component';

@Component({
  selector: 'app-confirmacion-reserva',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NavbarComponent,
    FooterComponent,
    OpenpayComponent,
  ],
  templateUrl: './confirmacion-reserva.component.html',
  styleUrls: ['./confirmacion-reserva.component.css'],
})
export class ConfirmarReservaComponent implements OnInit {
  reserva: any;
  cliente = { id: '', nombre: '', correo: '' };
  pagoRealizado: boolean = false;
  reservaConfirmada: boolean = false; 

  constructor(
    private router: Router,
    private reservaService: ReservaService,
    private location: Location,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    document.body.classList.remove('modal-open');
    document.querySelector('.modal-backdrop')?.remove();
    document.body.style.overflow = 'auto';
  
    const state = history.state;
  
  
    if (state.reserva) {
      this.reserva = state.reserva;
  
  
      this.location.replaceState('/confirmar-reserva', '');
  
      this.authService.obtenerUsuarioLogueado()
        .pipe(take(1))
        .subscribe({
          next: (response) => {
            if (response.status === 'success') {
              this.cliente = {
                id: response.id, 
                nombre: response.nombre, 
                correo: response.correo
              };
            } else {
              console.error('No se pudo obtener la información del usuario');
              this.router.navigate(['/login']);
            }
          },
          error: (error) => {
            console.error('Error al obtener los datos del usuario:', error);
            this.router.navigate(['/login']);
          },
        });
    } else {
      console.warn('No se encontró la reserva en el estado de la historia');
      this.router.navigate(['/']);
    }
  }
  

  actualizarEstadoPago(transactionId: string) {
    if (transactionId) {
      this.pagoRealizado = true;
      this.reserva.id_transaccion = transactionId;
    } else {
      console.error('Error: No se recibió un ID de transacción válido.');
    }
  }

  confirmarReserva(): void {
    if (this.pagoRealizado && this.cliente.nombre && this.cliente.correo) {
      const datosReserva = {
        usuario_id: this.cliente.id,
        habitacion_id: this.reserva.habitacion?.habitacion_id || null,
        fechaInicio: this.reserva.fechaInicio || null,
        fechaFin: this.reserva.fechaFin || null,
        totalReserva: this.reserva.habitacion.precio_total || 0,
        num_adultos: this.reserva.huespedesAdultos || 0,
        num_ninos: this.reserva.huespedesNinos || 0,
        id_transaccion: this.reserva.id_transaccion || 'No asignado'
      };

      this.reservaService.realizarReserva(datosReserva).pipe(take(1)).subscribe({
        next: (res) => {
          if (res.status === 'success') {
            alert('Reserva confirmada con éxito');
            this.reservaConfirmada = true; 
            this.router.navigate(['/'], { replaceUrl: true });
          } else {
            alert('Error al realizar la reserva');
          }
        },
        error: (error) => {
          console.error('Error en la reserva:', error);
        },
      });
    } else {
      alert('Por favor, completa todos los campos y realiza el pago antes de confirmar.');
    }
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event: any): void {
    if (this.reservaConfirmada) {
      this.router.navigate(['/']); 
    }
  }

  calcularDiasHospedaje(fechaInicio: string, fechaFin: string): number {
    if (!fechaInicio || !fechaFin) return 0;
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diferenciaMs = fin.getTime() - inicio.getTime();
    const dias = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));
    return dias > 0 ? dias : 1;
  }
}
