import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ComentariosService } from '../../services/comentarios.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-comentarios',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './list-comentarios.component.html',
  styleUrl: './list-comentarios.component.css',
})
export class ListComentariosComponent implements OnInit {
  comentarios: any[] = [];
  hotelId: number | null = null;
  calificacion: number = 5;
  comentario: string = '';
  mostrarTodos: boolean = false;
  @Input() isLoading: boolean = false;

  constructor(
    private comentarioService: ComentariosService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const state = history.state;
    if (state.hotelId) {
      this.hotelId = state.hotelId;
    } else {
      this.route.paramMap.subscribe((params) => {
        const id = params.get('hotelId');
        if (id) {
          this.hotelId = Number(id);
        }
      });
    }

    if (this.hotelId) {
      this.cargarComentarios();
    } else {
      console.warn('No se ha pasado un hotelId.');
    }
  }

  cargarComentarios(): void {
    if (this.hotelId) {
      this.comentarioService.getComentarios(this.hotelId).subscribe({
        next: (data: any) => {
          if (data.status === 'success') {
            this.comentarios = data.data;
          }
        },
        error: (error) => {
          console.error('Error al cargar comentarios', error);
        },
        complete: () => {
          console.log('Carga de comentarios completada');
        },
      });
    }
  }

  toggleMostrarTodos(): void {
    this.mostrarTodos = !this.mostrarTodos;
  }
}
