import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { HotelService } from '../../services/hoteles.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { HabitacionesAdminComponent } from './habitaciones-admin/habitaciones-admin.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Hotel } from '../../models/hotel.model';

@Component({
  selector: 'app-administrador',
  templateUrl: './administrador.component.html',
  imports: [
    CommonModule,
    FormsModule,
    FooterComponent,
    NavbarComponent,
    HabitacionesAdminComponent,
  ],
  styleUrls: ['./administrador.component.css'],
})

export class AdministradorComponent implements OnInit, OnDestroy {
  hoteles: Hotel[] = [];
  isLoading: boolean = true;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private hotelService: HotelService
  ) {}

  ngOnInit(): void {
    this.cargarHoteles();
  }

  cargarHoteles(): void {
    this.hotelService.obtenerHoteles()
      .pipe(takeUntil(this.destroy$)) 
      .subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.hoteles = response.data;

            if (this.hoteles.length === 0) {
              console.warn('Este administrador no tiene un hotel asignado.');
            } else {
              console.log('Hoteles asignados al admin:', this.hoteles);
            }
          } else {
            console.error('Error al obtener hoteles:', response.message);
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error al cargar hoteles:', error);
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(); 
    this.destroy$.complete(); 
  }
}
