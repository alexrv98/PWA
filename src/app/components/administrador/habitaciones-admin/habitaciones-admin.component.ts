import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { HabitacionesAdminService } from '../../../services/habitacionesAdmin.service';
import { CommonModule } from '@angular/common';
import { ModalAgregarHabitacionComponent } from './modal-agregar-habitacion/modal-agregar-habitacion.component';
import { ModalEditarHabitacionComponent } from './modal-editar-habitacion/modal-editar-habitacion.component';
import { DataTablesModule } from 'angular-datatables';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiResponse, HabitacionAdmin } from '../../../models/habitaciones.model';


@Component({
  selector: 'app-habitaciones-admin',
  templateUrl: './habitaciones-admin.component.html',
  imports: [
    CommonModule,
    ModalAgregarHabitacionComponent,
    ModalEditarHabitacionComponent,
    DataTablesModule,
  ],
  styleUrls: ['./habitaciones-admin.component.css'],
})
export class HabitacionesAdminComponent implements OnInit, OnDestroy {
  @Input() hotelId!: number;
  habitaciones: HabitacionAdmin[] = [];  
  mostrarModal = false;
  mostrarModalEditar = false;
  habitacionSeleccionada: HabitacionAdmin | null = null;  
  isLoading: boolean = true;

  dtOptions: any = {};  
  private destroy$ = new Subject<void>();

  constructor(private habitacionService: HabitacionesAdminService) {}

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      processing: true,
      paging: true,
      dom: 'Pfrtip',
      select: {
        style: 'multi',
        selector: 'td:first-child',
      },

      language: {
        url: 'https://cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json',
      },
    };

    if (this.hotelId) {
      this.cargarHabitaciones();
    }
  }

  cargarHabitaciones(): void {
    this.habitacionService.obtenerHabitaciones(this.hotelId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<HabitacionAdmin[]>) => {  // Tipamos la respuesta
          if (response.status === 'success') {
            this.habitaciones = response.data;
          }
          this.isLoading = false;
        },
        error: (error) => console.error('Error al cargar habitaciones:', error),
      });
  }

  abrirModal(): void {
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    window.location.reload();
  }

  abrirModalEditar(habitacion: HabitacionAdmin): void {
    if (habitacion) {
      this.habitacionSeleccionada = habitacion;  
      this.mostrarModalEditar = true;
    }
  }
  
  cerrarModalEditar(): void {
    this.mostrarModalEditar = false;
    window.location.reload();
  }

  eliminarHabitacion(idHabitacion: number): void {
    if (
      confirm(
        '¿Estás seguro de que quieres eliminar esta habitación? Esta acción no se puede deshacer.'
      )
    ) {
      this.habitacionService.eliminarHabitacion(idHabitacion)
        .pipe(takeUntil(this.destroy$)) 
        .subscribe({
          next: (response: ApiResponse<any>) => {  
            if (response.status === 'success') {
              alert('Habitación eliminada correctamente.');
              window.location.reload();
            } else {
              alert(response.message);
            }
          },
          error: (error) => {
            console.error('Error al eliminar la habitación:', error);
            alert('No se pudo eliminar la habitación.');
          },
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(); 
    this.destroy$.complete();
  }
}
