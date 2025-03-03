import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ReservaGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const state = history.state;
    if (state && state.reserva) {
      return true;
    } else {
      this.router.navigate(['/']);
      return false;
    }
  }
}
