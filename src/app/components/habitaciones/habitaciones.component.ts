import { Component, OnDestroy, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FiltroHotelesComponent } from './../filtro-hoteles/filtro-hoteles.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { ModalReservaComponent } from './modal-reserva/modal-reserva.component';
import { ComentariosComponent } from './comentarios/comentarios.component';
import { HabitacionesClienteService } from '../../services/habitacionesCliente.service';
import { ListComentariosComponent } from '../list-comentarios/list-comentarios.component';
import { Subject, takeUntil } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Habitacion, RespuestaHabitaciones } from '../../models/habitaciones.model';
import { FiltrosBusqueda } from '../../models/filtro-hoteles.model';

@Component({
  selector: 'app-habitaciones',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    FiltroHotelesComponent,
    ModalReservaComponent,
    ComentariosComponent,
    FormsModule,
    ListComentariosComponent,
    RouterLink,
  ],
  templateUrl: './habitaciones.component.html',
  styleUrls: ['./habitaciones.component.css'],
})

export class HabitacionesComponent implements OnInit, OnDestroy {
  hotelId!: number;
  hotelNombre: string = '';
  filtros: FiltrosBusqueda = {
    destino: 0,
    fechaInicio: '',
    fechaFin: '',
    huespedesAdultos: 1,
    huespedesNinos: 0,
    numCamas: 1,
  };
  habitaciones: { mejorOpcion: Habitacion[]; otrasHabitaciones: Habitacion[] } = { mejorOpcion: [], otrasHabitaciones: [] };
  mensajeBusqueda: string | null = null;
  isLoading: boolean = true;
  habitacionSeleccionada: Habitacion | null = null;
  habitacionesOriginales: { mejorOpcion: Habitacion[]; otrasHabitaciones: Habitacion[] } = { mejorOpcion: [], otrasHabitaciones: [] };
  filtroPrecioMin: number | null = null;
  filtroPrecioMax: number | null = null;
  imagenesHabitaciones: { [key: number]: string[] } = {};

  filtrosOriginales: FiltrosBusqueda = {
    destino: 0,
    fechaInicio: 'fecha_default',
    fechaFin: 'fecha_default',
    huespedesAdultos: 1,
    huespedesNinos: 0,
    numCamas: 1
  };

  private unsubscribe$ = new Subject<void>();

  @ViewChild('otrasopciones') otrasOpcionesRef!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private habitacionesService: HabitacionesClienteService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    const state = history.state;
    if (state.hotelId) {
      this.hotelId = state.hotelId;
    }
    if (state.hotelNombre) {
      this.hotelNombre = state.hotelNombre;
    }

    if (state.filtros) {
      this.filtrosOriginales = state.filtros;
      this.filtros = { ...state.filtros };
    } else {
      this.filtrosOriginales = {
        destino: 0,
        fechaInicio: 'fecha_default',
        fechaFin: 'fecha_default',
        huespedesAdultos: 1,
        huespedesNinos: 0,
        numCamas: 1
      };
      this.filtros = { ...this.filtrosOriginales };
    }

    this.obtenerHabitaciones();
  }

  obtenerHabitaciones() {
    const filtros = {
      hotelId: this.hotelId,
      fechaInicio: this.filtrosOriginales.fechaInicio,
      fechaFin: this.filtrosOriginales.fechaFin,
      adultos: this.filtrosOriginales.huespedesAdultos,
      ninos: this.filtrosOriginales.huespedesNinos,
      camas: this.filtrosOriginales.numCamas,
    };

    this.habitacionesService
      .obtenerHabitaciones(filtros)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res: RespuestaHabitaciones) => {
        if (res.status === 'success') {
          this.mensajeBusqueda = res.mensaje_busqueda || null;

          this.habitaciones = {
            mejorOpcion: res.habitacionesExactas,
            otrasHabitaciones: res.otrasHabitaciones,
          };

          this.habitacionesOriginales = JSON.parse(JSON.stringify(this.habitaciones));

          [...this.habitaciones.mejorOpcion, ...this.habitaciones.otrasHabitaciones].forEach(
            (habitacion: Habitacion) => {
              this.cargarImagenes(habitacion.habitacion_id);
            }
          );

          console.log("🚀 Habitaciones cargadas:", this.habitacionesOriginales);
        } else {
          console.error('Error al obtener habitaciones:', res.status);
          this.habitaciones = { mejorOpcion: [], otrasHabitaciones: [] };
        }

        this.isLoading = false;
      });
  }

  cargarImagenes(habitacionId: number) {
    this.habitacionesService.getImagenesHabitacion(habitacionId).subscribe(
      (res: { status: string, data: { img_url: string }[] }) => {  // Especificamos la respuesta
        if (res.status === 'success' && res.data.length > 0) {
          this.imagenesHabitaciones[habitacionId] = res.data.map((img) => img.img_url);
        } else {
          console.warn(`No se encontraron imágenes para la habitación ${habitacionId}`);
        }
      },
      (err) => {
        console.error('Error al obtener imágenes:', err);
      }
    );
  }

  filtrarPorPrecio() {
    const min = this.filtroPrecioMin ?? 0;
    const max = this.filtroPrecioMax ?? Number.MAX_SAFE_INTEGER;

    if (!this.habitacionesOriginales.mejorOpcion.length && !this.habitacionesOriginales.otrasHabitaciones.length) {
      console.warn("No hay habitaciones originales para filtrar");
      return;
    }

    this.habitaciones.mejorOpcion = this.habitacionesOriginales.mejorOpcion.filter(
      (habitacion: Habitacion) => habitacion.precio_calculado >= min && habitacion.precio_calculado <= max
    );

    this.habitaciones.otrasHabitaciones = this.habitacionesOriginales.otrasHabitaciones.filter(
      (habitacion: Habitacion) => habitacion.precio_calculado >= min && habitacion.precio_calculado <= max
    );

    this.habitaciones.mejorOpcion = [...this.habitaciones.mejorOpcion];
    this.habitaciones.otrasHabitaciones = [...this.habitaciones.otrasHabitaciones];

    this.cdr.detectChanges(); // Forzar actualización en la vista
  }

  seleccionarHabitacion(habitacion: Habitacion) {
    this.habitacionSeleccionada = habitacion;
  }

  scrollLeft() {
    document
      .getElementById('scrollContainer')!
      .scrollBy({ left: -300, behavior: 'smooth' });
  }

  scrollRight() {
    document
      .getElementById('scrollContainer')!
      .scrollBy({ left: 300, behavior: 'smooth' });
  }

  ngAfterViewInit() {
    this.route.fragment.subscribe((fragment) => {
      if (fragment === 'otrasopciones') {
        this.scrollToSection();
      }
    });
  }

  scrollToSection() {
    if (this.otrasOpcionesRef) {
      setTimeout(() => {
        this.otrasOpcionesRef.nativeElement.scrollIntoView({
          behavior: 'smooth',
        });
      }, 300);
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
