import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { LugarService } from '../../../services/lugar.service';
import { AuthService } from '../../../services/auth.service';
import { take } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FiltrosBusqueda } from '../../../models/filtro-hoteles.model';
import { Habitacion } from '../../../models/habitaciones.model';

@Component({
  selector: 'app-modal-reserva',
  templateUrl: './modal-reserva.component.html',
  imports: [CommonModule],
  styleUrls: ['./modal-reserva.component.css'],
})
export class ModalReservaComponent {
  @Input() habitacion: Habitacion | null = null;
  @Input() filtrosOriginales: FiltrosBusqueda | null = null;
  precioTotal: number = 0;

  constructor(
    private router: Router,
    private lugarService: LugarService,
    private authService: AuthService
  ) {}

  continuarReserva() {
    if (!this.habitacion || !this.filtrosOriginales) {
      console.error('Faltan datos para la reserva');
      return;
    }

    const reserva = {
      habitacion: this.habitacion, 
      fechaInicio: this.filtrosOriginales.fechaInicio, 
      fechaFin: this.filtrosOriginales.fechaFin,
      huespedesAdultos: this.filtrosOriginales.huespedesAdultos,
      huespedesNinos: this.filtrosOriginales.huespedesNinos,    
      destino: '',
    };

    this.lugarService.obtenerDestinoPorId(this.filtrosOriginales?.destino)
      .pipe(take(1))
      .subscribe((response) => {
        if (response.status === 'success') {
          reserva.destino = response.data.nombre;

          this.authService.obtenerUsuarioLogueado().subscribe({
            next: (userResponse) => {
              const usuarioAutenticado = userResponse.status === 'success' && userResponse.usuario;
              const ruta = usuarioAutenticado ? '/confirmar-reserva' : '/login';

              this.router.navigate([ruta], { state: { reserva }, replaceUrl: usuarioAutenticado });
            },
            error: () => {
              this.router.navigate(['/login']);
            }
          });
        } else {
          alert('Error al obtener el destino');
        }
      });
  }
}
