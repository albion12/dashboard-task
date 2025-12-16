import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { filter } from 'rxjs/operators';

type NavItem = { label: string; icon: string; path: string; matchStarts?: boolean };

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatDividerModule,
  ],
  templateUrl: './app-shell.component.html',
  styleUrls: ['./app-shell.component.scss'],
})
export class AppShellComponent implements OnInit {
  private router = inject(Router);

  // Toggle responsive mode: when viewport <= 960px, sidenav uses 'over'
  isMobile = signal<boolean>(false);
  sidenavOpened = signal<boolean>(this.getSavedSidenavState());

  // Left nav menu items
  navItems: NavItem[] = [
    { label: 'Home',      icon: 'home',       path: '/home' },
    { label: 'Dashboard', icon: 'analytics',  path: '/dashboard', matchStarts: true },
  ];

  ngOnInit(): void {
    // simple responsive check
    const updateViewport = () => {
      this.isMobile.set(window.matchMedia('(max-width: 960px)').matches);
      if (this.isMobile()) this.sidenavOpened.set(false);
    };
    updateViewport();
    window.addEventListener('resize', updateViewport);

    // close sidenav automatically on route change in mobile
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      if (this.isMobile()) this.sidenavOpened.set(false);
    });
  }

  toggleSidenav(): void {
    this.sidenavOpened.set(!this.sidenavOpened());
    this.saveSidenavState(this.sidenavOpened());
  }

  // For active link styling
  isActive(item: NavItem): boolean {
    const url = this.router.url;
    return item.matchStarts ? url.startsWith(item.path) : url === item.path;
  }

  private saveSidenavState(open: boolean) {
    localStorage.setItem('sidenav_open_v1', JSON.stringify(open));
  }
  private getSavedSidenavState(): boolean {
    try {
      const v = localStorage.getItem('sidenav_open_v1');
      return v ? JSON.parse(v) : true;
    } catch {
      return true;
    }
  }
}
