import { Component, OnInit, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { ComentariosService } from '../../../services/comentarios.service';

@Component({
  selector: 'app-comentarios',
  imports: [FormsModule, CommonModule],
  templateUrl: './comentarios.component.html',
  styleUrls: ['./comentarios.component.css'],
})
export class ComentariosComponent implements OnInit {
  comentarios: any[] = [];
  nuevoComentario = {
    texto: '',
    calificacion: 0,
    hotelId: null,
    usuarioId: null,
    nombreHotel: '',
  };
  estrellas = [1, 2, 3, 4, 5];
  comentariosMostrados = 2;
  estaAutenticado: boolean = false;
  hotelesReservados: any[] = [];
  @Input() isLoading: boolean = false;

  usuarioNombre: string = '';
  usuarioRol: string = '';

  constructor(
    private authService: AuthService,
    private comentariosService: ComentariosService
  ) {}

  ngOnInit(): void {
    this.authService.estaAutenticado().subscribe((isAuthenticated) => {
      this.estaAutenticado = isAuthenticated;

      if (isAuthenticated) {
        this.authService.obtenerUsuarioLogueado().subscribe({
          next: (response) => {
            if (response.status === 'success' && response.id && response.nombre) {
              // Asignar los datos del usuario
              this.usuarioNombre = response.nombre;
              this.usuarioRol = response.rol;
              this.nuevoComentario.usuarioId = response.id;
              this.cargarHotelesReservados();
            } else {
              console.error('Error al obtener los datos del usuario');
            }
          },
          error: (error) => {
            console.error('Error al obtener los datos del usuario:', error);
          },
        });
      } else {
        console.log('Usuario no autenticado');
      }
    });
  }

  cargarHotelesReservados(): void {
    this.comentariosService.getReservaciones().subscribe({
      next: (response) => {
        if (
          response &&
          response.status === 'success' &&
          response.data &&
          Array.isArray(response.data)
        ) {
          this.hotelesReservados = response.data.map((reserva: any) => ({
            id: reserva.hotel_id,
            nombre: reserva.hotel_nombre,
          }));
        } else {
          console.log('No se encontraron reservas o la respuesta es inválida.');
        }
      },
      error: (error) => {
        console.error('Error al cargar las reservas:', error);
      },
    });
  }

  agregarComentario(): void {
    if (
      !this.nuevoComentario.texto ||
      !this.nuevoComentario.calificacion ||
      !this.nuevoComentario.hotelId ||
      !this.nuevoComentario.usuarioId
    ) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    this.comentariosService
      .agregarComentario(
        this.nuevoComentario.hotelId,
        this.nuevoComentario.calificacion,
        this.nuevoComentario.texto,
        this.nuevoComentario.usuarioId
      )
      .subscribe({
        next: (response) => {
          console.log('Respuesta de la API:', response);
          if (response && response.status === 'success') {
            // Limpiar los campos de formulario
            this.nuevoComentario = {
              texto: '',
              calificacion: 0,
              hotelId: null,
              usuarioId: this.nuevoComentario.usuarioId,
              nombreHotel: '',
            };

            // Mostrar mensaje de éxito
            alert('Comentario agregado exitosamente.');

            // Recargar la página para actualizar la lista de comentarios
            window.location.reload();
          } else {
            console.error('Error al agregar comentario.');
          }
        },
        error: (error) => {
          console.error('Error al agregar comentario:', error);
        },
      });
  }

  seleccionarCalificacion(valor: number): void {
    this.nuevoComentario.calificacion = valor;
  }

  onHotelChange(): void {
    const selectedHotel = this.hotelesReservados.find(
      (hotel) => hotel.id == this.nuevoComentario.hotelId
    );
    if (selectedHotel) {
      this.nuevoComentario.nombreHotel = selectedHotel.nombre;
    } else {
      console.error('Hotel no encontrado en la lista de reservas');
    }
  }
}
