import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HabitacionesAdminService } from '../../../../services/habitacionesAdmin.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiResponse, HabitacionAdmin } from '../../../../models/habitaciones.model';

@Component({
  selector: 'app-modal-editar-habitacion',
  standalone: true,
  templateUrl: './modal-editar-habitacion.component.html',
  styleUrls: ['./modal-editar-habitacion.component.css'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class ModalEditarHabitacionComponent implements OnInit, OnDestroy {
  @Input() habitacion: HabitacionAdmin | null = null;
  @Output() habitacionEditada = new EventEmitter<void>();
  @Output() cerrarModal = new EventEmitter<void>();

  habitacionForm!: FormGroup;
  tiposHabitacion: { id: number, nombre: string, capacidad: number, camas: number }[] = [];
  mensaje: string = '';
  tipoMensaje: 'success' | 'error' | '' = '';
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private habitacionService: HabitacionesAdminService
  ) {}

  ngOnInit(): void {
    if (this.habitacion) { 
      this.habitacionForm = this.fb.group({
        numero_habitacion: [this.habitacion.numero_habitacion, Validators.required],
        tipo_habitacion_id: [this.habitacion.tipo_habitacion_id, Validators.required],
        precio: [this.habitacion.precio, [Validators.required, Validators.min(1)]]
      });
    } else {
      this.mostrarMensaje('No se pudo cargar la información de la habitación.', 'error');
    }

    this.cargarTiposHabitacion();
  }

  cargarTiposHabitacion(): void {
    this.habitacionService.obtenerTiposHabitacion()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<{ id: number, nombre: string, capacidad: number, camas: number }[]>) => {
          if (response.status === 'success') {
            this.tiposHabitacion = response.data;
          }
        },
        error: () => this.mostrarMensaje('Error al obtener tipos de habitación.', 'error')
      });
  }

  editarHabitacion(): void {
    if (this.habitacionForm.invalid) {
      this.mostrarMensaje('Por favor, complete todos los campos correctamente.', 'error');
      return;
    }

    const habitacionEditada: HabitacionAdmin = {
      id: this.habitacion?.id || 0,
      ...this.habitacionForm.value
    };

    this.habitacionService.editarHabitacion(habitacionEditada)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<any>) => {
          const mensaje = response.message || 'Operación completada con éxito'; 
          if (response.status === 'success') {
            this.mostrarMensaje(mensaje, 'success');
            setTimeout(() => {
              this.habitacionEditada.emit();
              this.cerrarModal.emit();
            }, 1500);
          } else {
            this.mostrarMensaje(mensaje, 'error');
          }
        },
        error: () => this.mostrarMensaje('Error al editar habitación.', 'error')
      });
  }

  mostrarMensaje(mensaje: string, tipo: 'success' | 'error'): void {
    this.mensaje = mensaje;
    this.tipoMensaje = tipo;
    setTimeout(() => {
      this.mensaje = '';
      this.tipoMensaje = '';
    }, 3000);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
