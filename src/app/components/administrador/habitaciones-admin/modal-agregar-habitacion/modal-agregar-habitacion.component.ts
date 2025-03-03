import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HabitacionesAdminService } from '../../../../services/habitacionesAdmin.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiResponse, TipoHabitacion } from '../../../../models/habitaciones.model'; // Importamos el tipo ApiResponse y TipoHabitacion

@Component({
  selector: 'app-modal-agregar-habitacion',
  standalone: true,
  templateUrl: './modal-agregar-habitacion.component.html',
  styleUrls: ['./modal-agregar-habitacion.component.css'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class ModalAgregarHabitacionComponent implements OnInit, OnDestroy {
  @Input() hotelId!: number;
  @Output() habitacionAgregada = new EventEmitter<void>();
  @Output() cerrarModal = new EventEmitter<void>();

  habitacionForm!: FormGroup;
  tiposHabitacion: TipoHabitacion[] = []; // Tipamos la lista de tipos de habitación
  mensaje: string = '';
  tipoMensaje: 'success' | 'error' | '' = '';
  imagenSeleccionada: string | ArrayBuffer | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private habitacionService: HabitacionesAdminService
  ) {}

  ngOnInit(): void {
    this.habitacionForm = this.fb.group({
      numero_habitacion: ['', Validators.required],
      tipo_habitacion_id: ['', Validators.required],
      precio: ['', [Validators.required, Validators.min(1)]],
      img_url: ['assets/', Validators.required]
    });

    this.cargarTiposHabitacion();
  }

  cargarTiposHabitacion(): void {
    this.habitacionService.obtenerTiposHabitacion()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<TipoHabitacion[]>) => { // Tipamos la respuesta
          if (response.status === 'success') {
            this.tiposHabitacion = response.data;
          }
        },
        error: () => this.mostrarMensaje('Error al obtener tipos de habitación.', 'error')
      });
  }

  // Manejar la selección de imagen
  onImageSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = () => {
        this.imagenSeleccionada = reader.result;
        this.habitacionForm.patchValue({
          img_url: 'assets/' + file.name
        });
      };

      reader.readAsDataURL(file);
    }
  }

  agregarHabitacion(): void {
    if (this.habitacionForm.invalid) {
      this.mostrarMensaje('Por favor, complete todos los campos correctamente.', 'error');
      return;
    }
  
    const nuevaHabitacion = {
      hotel_id: this.hotelId,
      ...this.habitacionForm.value
    };
  
    this.habitacionService.agregarHabitacion(nuevaHabitacion)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ApiResponse<any>) => { // Tipamos la respuesta de la API
          const mensaje = response.message ?? 'Operación completada con éxito'; // Proporcionamos un valor por defecto si message es undefined
          if (response.status === 'success') {
            this.mostrarMensaje(mensaje, 'success');
            setTimeout(() => {
              this.habitacionAgregada.emit();
              this.cerrarModal.emit();
            }, 1500);
          } else {
            this.mostrarMensaje(mensaje, 'error');
          }
        },
        error: () => this.mostrarMensaje('Error al agregar habitación.', 'error')
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
