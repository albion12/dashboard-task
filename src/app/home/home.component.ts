import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatCardModule, RouterModule, MatButtonModule],
  template: `
    <div class="home">
      <mat-card>
        <h1>Welcome 👋</h1>
        <p>This is the Home page. Jump into your dashboard to explore charts and data.</p>
        <a mat-stroked-button color="primary" routerLink="/dashboard">Open Dashboard</a>
      </mat-card>
    </div>
  `,
  styles: [`
    .home {
      padding: 1.25rem;
    }
    mat-card {
      max-width: 840px;
      margin: 0 auto;
      padding: 1.5rem;
    }
    h1 {
      margin: 0 0 .5rem 0;
      font-weight: 600;
    }
  `]
})
export class HomeComponent {}
