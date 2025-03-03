import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NavbarComponent,
    RouterLink,
    FooterComponent,
  ],
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, OnDestroy {
  correo: string = '';
  password: string = '';
  errorMessage: string = '';

  private unsubscribe$ = new Subject<void>();

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    document.body.classList.remove('modal-open');
    document.querySelector('.modal-backdrop')?.remove();
    document.body.style.overflow = 'auto';
  
    this.authService.estaAutenticado().pipe(
      takeUntil(this.unsubscribe$) 
    ).subscribe((isAuthenticated) => {
      
      if (isAuthenticated) {
        const state = history.state;
        if (state.reserva) {
          this.router.navigate(['/confirmar-reserva'], { state: { reserva: state.reserva } });
        } else {
          this.router.navigate(['/']);
        }
      }
    });
  }

  onLogin(): void {
    this.authService.login(this.correo, this.password)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (response) => {
          if (response.status === 'success') {
            const userRole = response.rol;
            const state = history.state;

            if (state.reserva) {
              this.router.navigate(['/confirmar-reserva'], { state: { reserva: state.reserva } });
            } else {
              this.router.navigate([userRole === 'admin' ? '/admin' : '/']).then(() => {
                window.history.replaceState(null, '', '/'); 
              });
            }
          } else {
            this.errorMessage = response.message;
          }
        },
        error: () => {
          this.errorMessage = 'Error en el servidor. Intente nuevamente.';
        },
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
