import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Guard para proteger las rutas
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);  // Inyección del servicio AuthService
  const router = inject(Router);  // Inyección del servicio Router

  // Verificar si existe un token válido
  const token = authService.getToken();

  if (token) {
    // Si el token está presente, permite el acceso
    return true;
  }

  // Si no hay token, redirige al login
  router.navigate(['/login']);
  return false;
};
