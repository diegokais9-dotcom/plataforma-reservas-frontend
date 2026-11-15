import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  const esRutaPublica =
    req.url.includes('/auth/login') || req.url.includes('/auth/register');

  if (token && !esRutaPublica) {
    const reqConToken = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
    return next(reqConToken);
  }

  return next(req);
};