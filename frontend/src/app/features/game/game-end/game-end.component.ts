import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Patient } from '../../../core/models/patient.model';
import { SessionStats } from '../../../core/models/session-stats.model';
import { PatientService } from '../../../core/services/patient.service';

@Component({
  selector: 'app-game-end',
  standalone: true,
  imports: [],
  templateUrl: './game-end.component.html',
  styleUrl: './game-end.component.scss',
})
export class GameEndComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly patientService = inject(PatientService);

  patient?: Patient;
  session?: SessionStats;
  stars: 1 | 2 | 3 = 1;

  ngOnInit(): void {
    const sessionId = this.route.snapshot.paramMap.get('sessionId');
    const result = sessionId ? this.patientService.getSessionById(sessionId) : undefined;

    if (!result) {
      void this.router.navigate(['/dashboard']);
      return;
    }

    this.session = result.session;
    this.patient = this.patientService.getPatientById(result.patientId);
    this.stars = this.calculateStars(result.session);
  }

  get score(): number {
    return this.stars * 250;
  }

  replay(): void {
    if (this.patient) {
      void this.router.navigate(['/game', this.patient.id], { queryParams: { autostart: true } });
    }
  }

  changeTheme(): void {
    if (this.patient) {
      void this.router.navigate(['/game', this.patient.id]);
    }
  }

  quit(): void {
    if (this.patient) {
      void this.router.navigate(['/patient', this.patient.id]);
    }
  }

  private calculateStars(session: SessionStats): 1 | 2 | 3 {
    const rate = session.obstaclesCleared / Math.max(1, session.obstaclesCleared + session.obstaclesMissed);
    return rate >= 0.8 ? 3 : rate >= 0.5 ? 2 : 1;
  }
}
