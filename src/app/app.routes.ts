import { Routes } from '@angular/router';
import { AppShellComponent } from './shell/app-shell.component';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { authGuard } from './core/services/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, title: 'Login' },
  { path: 'register', component: RegisterComponent, title: 'Register' },
  {
    path: '',
    component: AppShellComponent, // shell holds sidenav + toolbar
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'home', component: HomeComponent, title: 'Home', canActivate: [authGuard] },
      {
        path: 'dashboard',
        component: DashboardComponent,
        title: 'Dashboard',
        canActivate: [authGuard],
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
