import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoginResponse {
  accessToken: string;
  user: {
    email: string;
    role?: string;
  };
}

export interface User {
  email: string;
  role?: string;
}

const TOKEN_KEY = 'auth_token_v1';
const USER_KEY = 'auth_user_v1';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private _user = signal<User | null>(this.getStoredUser());
  user$ = this._user.asReadonly();

  constructor() {
    // Restore user from localStorage on service init
    const token = this.getToken();
    if (token) {
      const storedUser = this.getStoredUser();
      if (storedUser) {
        this._user.set(storedUser);
      }
    }
  }

  /**
   * Login with email and password
   * Returns Observable that emits true on success, or throws error
   */
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiBaseUrl}/auth/login`, { email, password })
      .pipe(
        tap((response) => {
          this.setToken(response.accessToken);
          this.setUser(response.user);
        }),
        catchError((error) => {
          return throwError(() => error);
        })
      );
  }

  /**
   * Get current user info from backend
   */
  me(): Observable<User> {
    return this.http.get<User>(`${environment.apiBaseUrl}/auth/me`).pipe(
      tap((user) => {
        this.setUser(user);
      }),
      catchError((error) => {
        // If 401, token is invalid - clear auth state
        if (error.status === 401) {
          this.logout();
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Logout and clear auth state
   */
  logout(): void {
    this.clearToken();
    this.clearUser();
    this.router.navigate(['/login']);
  }

  /**
   * Check if user is authenticated (has valid token)
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Get stored JWT token
   */
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  /**
   * Get current user
   */
  getUser(): User | null {
    return this._user();
  }

  /**
   * Store token in localStorage
   */
  private setToken(token: string): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Failed to store token', error);
    }
  }

  /**
   * Clear token from localStorage
   */
  private clearToken(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error('Failed to clear token', error);
    }
  }

  /**
   * Store user in memory and localStorage
   */
  private setUser(user: User): void {
    this._user.set(user);
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Failed to store user', error);
    }
  }

  /**
   * Clear user from memory and localStorage
   */
  private clearUser(): void {
    this._user.set(null);
    try {
      localStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Failed to clear user', error);
    }
  }

  /**
   * Get stored user from localStorage
   */
  private getStoredUser(): User | null {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
}
