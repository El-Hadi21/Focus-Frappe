import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Patient } from '../../../core/models/patient.model';
import { SessionStats } from '../../../core/models/session-stats.model';
import { PatientService } from '../../../core/services/patient.service';
import { SessionService } from '../../../core/services/session.service';

export interface ConfettiPiece {
  id: number;
  leftPercent: number;
  delayMs: number;
  durationMs: number;
  color: string;
  rotationDeg: number;
}

@Component({
  selector: 'app-game-end',
  standalone: true,
  imports: [],
  templateUrl: './game-end.component.html',
  styleUrl: './game-end.component.scss',
})
export class GameEndComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly patientService = inject(PatientService);
  private readonly sessionService = inject(SessionService);

  patient?: Patient;
  session?: SessionStats;
  stars: 1 | 2 | 3 = 1;
  visibleStarsCount = 0;
  displayedScore = 0;
  confettiPieces: ConfettiPiece[] = [];

  private timers: ReturnType<typeof setTimeout>[] = [];
  private scoreFrame?: number;

  ngOnInit(): void {
    const sessionId = this.route.snapshot.paramMap.get('sessionId');
    if (!sessionId) {
      void this.router.navigate(['/dashboard']);
      return;
    }

    this.sessionService.getSessionById(sessionId).subscribe({
      next: (result) => {
        this.session = result.session;
        this.stars = this.calculateStars(result.session);

        this.patientService.getPatientById(result.patientId).subscribe({
          next: (patient) => {
            this.patient = patient;
            this.startEndAnimations();
          },
          error: () => {
            void this.router.navigate(['/dashboard']);
          },
        });
      },
      error: () => {
        void this.router.navigate(['/dashboard']);
      },
    });
  }

  ngOnDestroy(): void {
    for (const timer of this.timers) {
      clearTimeout(timer);
    }
    if (this.scoreFrame !== undefined) {
      cancelAnimationFrame(this.scoreFrame);
    }
  }

  get score(): number {
    return this.stars * 250;
  }

  replay(): void {
    if (this.patient && this.session) {
      void this.router.navigate(['/game', this.patient.id], {
        queryParams: { autostart: true, sessionId: this.session.id },
      });
    }
  }

  changeTheme(): void {
    if (this.patient && this.session) {
      void this.router.navigate(['/game', this.patient.id], {
        queryParams: { sessionId: this.session.id },
      });
    }
  }

  quit(): void {
    if (this.patient) {
      void this.router.navigate(['/patient', this.patient.id]);
    }
  }

  private startEndAnimations(): void {
    this.visibleStarsCount = 0;
    this.displayedScore = 0;

    // 1. Apparition des étoiles une par une
    for (let index = 1; index <= this.stars; index += 1) {
      const timer = setTimeout(() => {
        this.visibleStarsCount = index;
      }, index * 320);
      this.timers.push(timer);
    }

    // 2. Défilement progressif du score
    const targetScore = this.score;
    const durationMs = 1100;
    const startAt = performance.now() + 250;

    const step = (now: number): void => {
      if (now < startAt) {
        this.scoreFrame = requestAnimationFrame(step);
        return;
      }
      const progress = Math.min(1, (now - startAt) / durationMs);
      const eased = 1 - (1 - progress) ** 3;
      this.displayedScore = Math.round(targetScore * eased);
      if (progress < 1) {
        this.scoreFrame = requestAnimationFrame(step);
      }
    };
    this.scoreFrame = requestAnimationFrame(step);

    // 3. Pluie de confettis pour 3 étoiles
    if (this.stars === 3 && !this.session?.config.reducedEffects) {
      const colors = ['#facc15', '#22c55e', '#38bdf8', '#f472b6', '#fb923c', '#a855f7'];
      this.confettiPieces = Array.from({ length: 28 }, (_, index) => ({
        id: index,
        leftPercent: (index * 100) / 28 + (Math.random() * 2.5 - 1.25),
        delayMs: Math.round(Math.random() * 650),
        durationMs: 2200 + Math.round(Math.random() * 1100),
        color: colors[index % colors.length],
        rotationDeg: Math.round(Math.random() * 360),
      }));
    }
  }

  private calculateStars(session: SessionStats): 1 | 2 | 3 {
    const rate = session.obstaclesCleared / Math.max(1, session.obstaclesCleared + session.obstaclesMissed);
    return rate >= 0.8 ? 3 : rate >= 0.5 ? 2 : 1;
  }
}
