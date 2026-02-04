import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { DashboardContainerComponent } from './features/dashboard/dashboard-container/dashboard-container.component';
import { LoginComponent } from './features/auth/login/login.component';
import { ProfileComponent } from './features/auth/profile/profile.component';
import { NotFoundComponent } from './components/not-found/not-found.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        component: DashboardContainerComponent,
        title: 'Dashboard',
      },
    ],
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'Login',
  },
  {
    path: 'profile',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        component: ProfileComponent,
        title: 'Profile',
      },
    ],
  },
  {
    path: '**',
    component: NotFoundComponent,
    title: 'Page Not Found',
  },
];
