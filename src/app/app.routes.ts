import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
    { path: 'signup', loadComponent: () => import('./components/signup/signup.component').then(m => m.SignupComponent) },
    { path: 'documents', loadComponent: () => import('./components/document-list/document-list.component').then(m => m.DocumentListComponent), canActivate: [authGuard, roleGuard], data: { roles: ['admin', 'editor', 'viewer'] } },
    { path: 'upload', loadComponent: () => import('./components/document-upload/document-upload.component').then(m => m.DocumentUploadComponent), canActivate: [authGuard, roleGuard], data: { roles: ['admin', 'editor'] } },
    { path: 'users', loadComponent: () => import('./components/user-management/user-management.component').then(m => m.UserManagementComponent), canActivate: [authGuard, roleGuard], data: { roles: ['admin'] } },
    { path: 'qa', loadComponent: () => import('./components/qa-interface/qa-interface.component').then(m => m.QaInterfaceComponent), canActivate: [authGuard, roleGuard], data: { roles: ['admin', 'editor', 'viewer'] } },
    { path: 'ingestion-status', loadComponent: () => import('./components/ingestion-status/ingestion-status.component').then(m => m.IngestionStatusComponent), canActivate: [authGuard, roleGuard], data: { roles: ['admin', 'editor'] } },
];
