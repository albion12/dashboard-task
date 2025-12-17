import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class AppComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    // Restore session on app startup
    this.restoreSession();
  }

  /**
   * Restore user session on app startup if token exists
   */
  private restoreSession(): void {
    const token = this.auth.getToken();
    
    if (token) {
      // Validate token by calling /auth/me
      this.auth.me().subscribe({
        next: () => {
          // Session restored successfully
          // User state is already updated in AuthService.me()
        },
        error: () => {
          // Token is invalid or expired - interceptor will handle logout
          // Just ensure we're not stuck on a protected route
          if (this.router.url !== '/login') {
            this.auth.logout();
          }
        },
      });
    }
  }
}
