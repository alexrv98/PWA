import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LugarService } from '../../services/lugar.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Destino, FiltrosBusqueda } from '../../models/filtro-hoteles.model';

@Component({
  selector: 'app-filtro-hoteles',
  templateUrl: './filtro-hoteles.component.html',
  imports: [CommonModule, FormsModule],
  styleUrls: ['./filtro-hoteles.component.css'],
})
export class FiltroHotelesComponent implements OnInit {
  destinos: Destino[] = [];
  fechaMinima: string = '';
  fechaMaxima: string = '';

  @Input() filtros: FiltrosBusqueda = {
    destino: 0,
    fechaInicio: '',
    fechaFin: '',
    huespedesAdultos: 1,
    huespedesNinos: 0,
    numCamas: 1,
  };


  private unsubscribe$ = new Subject<void>();

  constructor(private lugarService: LugarService, private router: Router) {}

  ngOnInit() {
    this.cargarDestinos();
    this.establecerFechasMinMax();
  }

  cargarDestinos() {
    this.lugarService
      .obtenerLugares()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.destinos = response.data;
          } else {
            console.error('Error al obtener destinos:', response.message);
          }
        },
        error: (error) => console.error('Error en la API:', error),
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  buscarHoteles() {
    const {
      destino,
      fechaInicio,
      fechaFin,
      huespedesAdultos,
      huespedesNinos,
      numCamas,
    } = this.filtros;

    if (!destino || !fechaInicio || !fechaFin || huespedesAdultos < 1) {
      alert('Por favor, completa todos los campos.');
      return;
    }
    if (!this.validarFechas()) {
      return;
    }

    this.router.navigate(['/buscar'], { state: { filtros: this.filtros } });
  }

  establecerFechasMinMax() {
    const hoy = new Date();
    const maxFecha = new Date();
    maxFecha.setFullYear(hoy.getFullYear() + 1);

    this.fechaMinima = hoy.toISOString().split('T')[0];
    this.fechaMaxima = maxFecha.toISOString().split('T')[0];
  }

  validarFechas(): boolean {
    const fechaInicio = new Date(this.filtros.fechaInicio);
    const fechaFin = new Date(this.filtros.fechaFin);
    const hoy = new Date();
    const maxFecha = new Date();
    maxFecha.setFullYear(hoy.getFullYear() + 1);

    const hoyString = hoy.toISOString().split('T')[0];
    const fechaInicioString = fechaInicio.toISOString().split('T')[0];
    const fechaFinString = fechaFin.toISOString().split('T')[0];

    // Validar fecha de inicio no anterior a hoy
    if (fechaInicioString < hoyString) {
      alert('La fecha de inicio no puede ser anterior a hoy.');
      this.filtros.fechaInicio = hoyString;
      return false;
    }

    if (fechaFinString < fechaInicioString) {
      alert('La fecha de fin no puede ser anterior a la fecha de inicio.');
      this.filtros.fechaFin = fechaInicioString;
      return false;
    }

    if (fechaFinString > maxFecha.toISOString().split('T')[0]) {
      alert('El rango máximo permitido es de 1 año.');
      this.filtros.fechaFin = maxFecha.toISOString().split('T')[0];
      return false;
    }

    return true;
  }

  // ----------------------------------------------------------
  mostrarInputs: boolean = false;

  get totalPersonas(): number {
    return this.filtros.huespedesAdultos + this.filtros.huespedesNinos;
  }

  mostrarOpciones() {
    this.mostrarInputs = true;
  }

  ocultarOpciones(event: Event) {
    const clickedElement = event.target as HTMLElement;
    if (!clickedElement.closest('.grupo-huespedes')) {
      this.mostrarInputs = false;
    }
  }

  cambiarCantidad(
    tipo: 'adultos' | 'ninos' | 'camas',
    operacion: 'sumar' | 'restar'
  ) {
    if (tipo === 'adultos') {
      if (operacion === 'sumar' && this.filtros.huespedesAdultos < 6) {
        this.filtros.huespedesAdultos++;
      } else if (operacion === 'restar' && this.filtros.huespedesAdultos > 1) {
        this.filtros.huespedesAdultos--;
      }
    }
  
    if (tipo === 'ninos') {
      if (operacion === 'sumar' && this.filtros.huespedesNinos < 4) {
        this.filtros.huespedesNinos++;
      } else if (operacion === 'restar' && this.filtros.huespedesNinos > 0) {
        this.filtros.huespedesNinos--;
      }
    }
  
    if (tipo === 'camas') {
      if (operacion === 'sumar') {
        this.filtros.numCamas++;
      } else if (operacion === 'restar' && this.filtros.numCamas > 1) {
        this.filtros.numCamas--;
      }
    }
  }
  
}
