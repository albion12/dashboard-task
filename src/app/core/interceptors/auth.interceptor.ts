import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

/**
 * HTTP Interceptor that:
 * 1. Adds Authorization header with JWT token to requests to API_BASE_URL
 * 2. Handles 401 responses by logging out and redirecting to login
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Only add token to requests to our API
  const isApiRequest = req.url.startsWith(environment.apiBaseUrl);
  
  if (isApiRequest) {
    const token = authService.getToken();
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized - token expired or invalid
      if (error.status === 401 && isApiRequest) {
        // Don't logout if we're already on login page or calling /auth/login
        const isLoginRequest = req.url.includes('/auth/login');
        const isMeRequest = req.url.includes('/auth/me');
        
        if (!isLoginRequest) {
          // Clear auth state and redirect to login
          authService.logout();
        }
      }
      return throwError(() => error);
    })
  );
};

