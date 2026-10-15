import { Routes } from '@angular/router';

import { DashboardComponent } from './features/therapist/dashboard/dashboard.component';
import { LoginComponent } from './features/therapist/login/login.component';
import { EngineComponent } from './features/game/engine/engine.component';
import { GameEndComponent } from './features/game/game-end/game-end.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'create-profile', loadComponent: () => import('./features/therapist/create-profile/create-profile.component').then(m => m.CreateProfileComponent) },
  { path: 'patient/:id', loadComponent: () => import('./features/therapist/patient-hub/patient-hub.component').then(m => m.PatientHubComponent) },
  { path: 'game/:patientId', component: EngineComponent },
  { path: 'configuration/:id', loadComponent: () => import('./features/therapist/session-config/session-config.component').then(m => m.SessionConfigComponent) },
  { path: 'stats/:id', loadComponent: () => import('./features/therapist/patient-stats/patient-stats.component').then(m => m.PatientStatsComponent) },
  { path: 'game-end/:sessionId', component: GameEndComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' },
];
