import { Component, OnInit, OnDestroy } from '@angular/core';
import { ReservaService } from '../../../services/reserva.service';
import { NavbarComponent } from '../../navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { DataTablesModule } from 'angular-datatables';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Reservacion, RespuestaReservaciones } from '../../../models/reservaciones.model';

@Component({
  selector: 'app-reservaciones-admin',
  templateUrl: './reservaciones-admin.component.html',
  imports: [CommonModule, NavbarComponent, DataTablesModule],
  styleUrls: ['./reservaciones-admin.component.css'],
})
export class ReservacionesAdminComponent implements OnInit, OnDestroy {
  reservaciones: Reservacion[] = [];
  nombreHotel: string = '';
  dtOptions: any = {};
  private destroy$ = new Subject<void>();

  constructor(private reservacionService: ReservaService) {}

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

    this.reservacionService.obtenerReservacionesAdmin()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: RespuestaReservaciones) => {
          if (response.status === 'success') {
            this.reservaciones = response.data;

            if (this.reservaciones.length > 0) {
              this.nombreHotel = this.reservaciones[0].nombre_hotel;
            }
          } else {
            console.error('No se encontraron reservaciones:', response.message);
          }
        },
        error: (error) => {
          console.error('Error al cargar las reservaciones:', error);
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
