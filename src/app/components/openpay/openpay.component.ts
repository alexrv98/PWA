import { Component, EventEmitter, Input, Output, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReservaService } from '../../services/reserva.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

declare var OpenPay: any; 

@Component({
  selector: 'app-openpay',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './openpay.component.html',
  styleUrl: './openpay.component.css',
})

export class OpenpayComponent implements OnDestroy {
  @Output() pagoExitoso = new EventEmitter<string>();
  @Input() totalReserva: number = 0;

  cliente = {
    id: '',
    nombre: '',
    apellido: '',
    correo: '',
    telefono: '',
    direccion: '',
    estado: '',
    ciudad: '',
    codigo_postal: ''
  };

  tarjeta = {
    card_number: '',
    holder_name: '',
    expiration_date: '',
    cvv: ''
  };

  errores: any = {};
  private destroy$ = new Subject<void>();

  constructor(private reservaService: ReservaService) {}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  realizarPago() {
    if (!this.validarFormulario()) {
      return; 
    }

    OpenPay.setId('m0etd0av2nzfl0bte1oh');
    OpenPay.setApiKey('pk_6c863e19f5cb400ea6ade202c2ae107b');
    OpenPay.setSandboxMode(true);

    const deviceSessionId = OpenPay.deviceData.setup("payment-form", "device_session_id");

    const expirationArray = this.tarjeta.expiration_date.split('/');
    if (expirationArray.length !== 2) {
      this.errores.expiration_date = "Formato de fecha de expiración incorrecto. Usa MM/YY.";
      return;
    }

    const expirationMonth = expirationArray[0].trim();
    const expirationYear = expirationArray[1].trim();

    const cardData = {
      card_number: this.tarjeta.card_number,
      holder_name: this.tarjeta.holder_name,
      expiration_month: expirationMonth,
      expiration_year: expirationYear,
      cvv2: this.tarjeta.cvv
    };

    if (!cardData.card_number || !cardData.holder_name || !cardData.expiration_month || !cardData.expiration_year || !cardData.cvv2) {
      alert("Por favor, complete los datos correctamente.");
      return;
    }

    OpenPay.token.create(cardData, (response: any) => {
      if (response.error) {
        alert('Error al procesar el pago: ' + response.error.message);
        return;
      }
      const token = response.data.id;
      this.enviarPagoAlServidor(token, deviceSessionId);
    }, (error: any) => {
      alert('Error al procesar el pago: ' + error.message);
    });
  }

  enviarPagoAlServidor(token: string, deviceSessionId: string) {
    const datosPago = {
      token,
      totalReserva: this.totalReserva,
      device_session_id: deviceSessionId,
      cliente: { ...this.cliente }
    };

    this.reservaService.realizarPago(datosPago).pipe(
      takeUntil(this.destroy$)
    ).subscribe((res) => {
      if (res.status === 'success') {
        const transactionId = res.transaction_id;
        this.pagoExitoso.emit(transactionId); 
        alert("¡Pago realizado con éxito!"); 
      } else {
        console.error('Error en el pago:', res);
        alert('Error en el pago');
      }
    });
  }

  validarFormulario() {
    this.errores = {};

    if (!this.cliente.nombre) {
      this.errores.nombre = 'El nombre es obligatorio.';
    }
    if (!this.cliente.apellido) {
      this.errores.apellido = 'El apellido es obligatorio.';
    }
    if (!this.cliente.correo || !this.validarCorreo(this.cliente.correo)) {
      this.errores.correo = 'Correo electrónico no válido.';
    }
    if (this.cliente.telefono && this.cliente.telefono.length !== 10) {
      this.errores.telefono = 'El teléfono debe tener 10 dígitos.';
    }
    if (!this.cliente.direccion) {
      this.errores.direccion = 'La dirección es obligatoria.';
    }
    if (!this.cliente.estado) {
      this.errores.estado = 'El estado es obligatorio.';
    }
    if (!this.cliente.ciudad) {
      this.errores.ciudad = 'La ciudad es obligatoria.';
    }
    if (!this.cliente.codigo_postal || this.cliente.codigo_postal.length !== 5) {
      this.errores.codigo_postal = 'El código postal debe tener 5 dígitos.';
    }

    // Validación de la tarjeta
    if (!this.tarjeta.card_number || this.tarjeta.card_number.length !== 16) {
      this.errores.card_number = 'Número de tarjeta inválido.';
    }
    if (!this.tarjeta.holder_name) {
      this.errores.holder_name = 'El nombre en la tarjeta es obligatorio.';
    }
    if (!this.tarjeta.expiration_date) {
      this.errores.expiration_date = 'La fecha de expiración es obligatoria.';
    }
    if (!this.tarjeta.cvv || this.tarjeta.cvv.length !== 3) {
      this.errores.cvv = 'CVV incorrecto.';
    }

    return Object.keys(this.errores).length === 0; 
  }

  validarCorreo(correo: string): boolean {
    const correoRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return correoRegex.test(correo);
  }
}
