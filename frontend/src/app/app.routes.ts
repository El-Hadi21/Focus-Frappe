import { Routes } from '@angular/router';

import { DashboardComponent } from './features/therapist/dashboard/dashboard.component';
import { LoginComponent } from './features/therapist/login/login.component';
import { EngineComponent } from './features/game/engine/engine.component';
import { GameEndComponent } from './features/game/game-end/game-end.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'game/:patientId', component: EngineComponent },
  { path: 'game-end/:sessionId', component: GameEndComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' },
];
