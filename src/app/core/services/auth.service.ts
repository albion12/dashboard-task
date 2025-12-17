import { Injectable, signal } from '@angular/core';

const AUTH_KEY = 'auth_is_authenticated_v1';
const AUTH_EMAIL = 'admin@example.com';
const AUTH_PASSWORD = 'admin123';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _isAuthenticated = signal<boolean>(this.readFromStorage());

  isAuthenticated(): boolean {
    return this._isAuthenticated();
  }

  login(email: string, password: string): boolean {
    const success = email === AUTH_EMAIL && password === AUTH_PASSWORD;
    this._isAuthenticated.set(success);
    this.writeToStorage(success);
    return success;
  }

  logout(): void {
    this._isAuthenticated.set(false);
    this.writeToStorage(false);
  }

  private readFromStorage(): boolean {
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      return stored === 'true';
    } catch {
      return false;
    }
  }

  private writeToStorage(value: boolean): void {
    try {
      localStorage.setItem(AUTH_KEY, value ? 'true' : 'false');
    } catch {
      // ignore
    }
  }
}


