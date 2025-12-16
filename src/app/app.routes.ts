import { Routes } from '@angular/router';
import { AppShellComponent } from './shell/app-shell.component';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';

export const routes: Routes = [
  {
    path: '',
    component: AppShellComponent, // shell holds sidenav + toolbar
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'home' },
      { path: 'home', component: HomeComponent, title: 'Home' },
      { path: 'dashboard', component: DashboardComponent, title: 'Dashboard' },
    ],
  },
  { path: '**', redirectTo: 'home' },
];
