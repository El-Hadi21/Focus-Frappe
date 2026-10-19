import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Patient } from '../../../core/models/patient.model';
import { SessionStats } from '../../../core/models/session-stats.model';
import { PatientService } from '../../../core/services/patient.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';

interface ChartPoint {
  x: number;
  y: number;
  valueLabel: string;
  sessionLabel: string;
  tooltip: string;
  isLast: boolean;
}

@Component({
  selector: 'app-patient-stats',
  standalone: true,
  imports: [DatePipe, DecimalPipe, FormsModule, LoaderComponent],
  templateUrl: './patient-stats.component.html',
  styleUrl: './patient-stats.component.scss',
})
export class PatientStatsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly patientService = inject(PatientService);
  private readonly router = inject(Router);

  patient: Patient | undefined;
  sessions: SessionStats[] = [];
  lastSession: SessionStats | undefined;
  isLoading = true;
  selectedChart: 'score' | 'clearance' | 'responseTime' = 'score';
  notesDraft = '';
  notesSaved = false;
  notesSaveError = false;
  isSavingNotes = false;
  private patientId = '';

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.patientId) {
      void this.router.navigate(['/dashboard']);
      return;
    }

    this.patientService.getPatientById(this.patientId).subscribe({
      next: (patient) => {
        this.patient = patient;
        this.patientService.getPatientStats(this.patientId).subscribe({
          next: (sessions) => {
            this.sessions = [...sessions].sort(
              (first, second) => second.date.getTime() - first.date.getTime(),
            );
            this.lastSession = this.sessions[0];
            this.notesDraft = this.lastSession?.notes ?? '';
            this.isLoading = false;
          },
          error: () => {
            this.sessions = [];
            this.lastSession = undefined;
            this.isLoading = false;
          },
        });
      },
      error: () => {
        void this.router.navigate(['/dashboard']);
      },
    });
  }

  goBack(): void {
    void this.router.navigate(['/patient', this.patientId]);
  }

  getAccuracy(session: SessionStats): number {
    return this.getClearanceRate(session);
  }

  getClearanceRate(session: SessionStats): number {
    const totalObstacles = session.obstaclesCleared + session.obstaclesMissed;
    return totalObstacles === 0 ? 0 : (session.obstaclesCleared / totalObstacles) * 100;
  }

  hasEnoughDataForVariability(session: SessionStats): boolean {
    return session.obstaclesCleared >= 10;
  }

  get totalAbandons(): number {
    return this.sessions.reduce((total, session) => total + session.abandons, 0);
  }

  get totalPlayedDurationSec(): number {
    return this.sessions.reduce((total, session) => total + session.playedDurationSec, 0);
  }

  get totalPlannedDurationSec(): number {
    return this.sessions.reduce((total, session) => total + session.plannedDurationSec, 0);
  }

  get chronologicalSessions(): SessionStats[] {
    return [...this.sessions].reverse();
  }

  get chartUnit(): string {
    if (this.selectedChart === 'score') {
      return 'Score';
    }

    return this.selectedChart === 'clearance' ? 'Taux de franchissement' : 'Temps de réponse';
  }

  get chartScaleLabels(): string[] {
    const max = this.chartMaxValue;
    const suffix = this.selectedChart === 'score' ? ' pts' : this.selectedChart === 'clearance' ? ' %' : ' s';

    return [1, 0.75, 0.5, 0.25, 0].map((ratio) => {
      const value = max * ratio;
      return `${value.toFixed(this.selectedChart === 'score' ? 0 : 1)}${suffix}`;
    });
  }

  get chartMaxValue(): number {
    return Math.max(...this.chronologicalSessions.map((session) => this.getChartValue(session)), 1);
  }

  get chartPoints(): ChartPoint[] {
    const sessions = this.chronologicalSessions;
    const xStart = 42;
    const xEnd = 558;
    const yTop = 18;
    const yBottom = 138;
    const xStep = sessions.length > 1 ? (xEnd - xStart) / (sessions.length - 1) : 0;
    const max = this.chartMaxValue;

    return sessions.map((session, index) => {
      const value = this.getChartValue(session);
      const point: ChartPoint = {
        x: sessions.length > 1 ? xStart + index * xStep : (xStart + xEnd) / 2,
        y: yBottom - (value / max) * (yBottom - yTop),
        valueLabel: this.formatChartValue(value),
        sessionLabel: `S${index + 1}`,
        tooltip: this.getChartPointTooltip(session, index),
        isLast: index === sessions.length - 1,
      };

      return point;
    });
  }

  get polylinePoints(): string {
    return this.chartPoints.map(({ x, y }) => `${x},${y}`).join(' ');
  }

  get areaPath(): string {
    const points = this.chartPoints;
    if (points.length === 0) {
      return '';
    }

    const baseline = 138;
    const first = points[0];
    const last = points[points.length - 1];
    return `M ${first.x} ${baseline} L ${points.map(({ x, y }) => `${x} ${y}`).join(' L ')} L ${last.x} ${baseline} Z`;
  }

  private formatChartValue(value: number): string {
    if (this.selectedChart === 'score') {
      return `${value.toFixed(0)} pts`;
    }

    return `${value.toFixed(1)}${this.selectedChart === 'clearance' ? ' %' : ' s'}`;
  }

  private getChartPointTooltip(session: SessionStats, index: number): string {
    return [
      `${this.getChartPointDate(session)} - Séance ${index + 1}`,
      `Valeur : ${this.formatChartValue(this.getChartValue(session))}`,
      `Palier ${session.config.difficulty}`,
      `Mode : ${session.config.mode}`,
      `Durée : ${session.config.durationSeconds}s`,
    ].join(' | ');
  }

  private getChartPointDate(session: SessionStats): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(session.date);
  }

  getChartValue(session: SessionStats): number {
    if (this.selectedChart === 'clearance') {
      return this.getClearanceRate(session);
    }

    return this.selectedChart === 'responseTime'
      ? session.avgResponseTimeSec
      : session.score;
  }

  saveNotes(): void {
    if (!this.lastSession || this.isSavingNotes) {
      return;
    }

    this.isSavingNotes = true;
    this.notesSaved = false;
    this.notesSaveError = false;
    this.patientService
      .saveSessionNotes(this.patientId, this.lastSession.id, this.notesDraft.trim())
      .subscribe({
        next: (saved) => {
          this.isSavingNotes = false;
          this.notesSaved = saved;
          if (saved) {
            this.lastSession!.notes = this.notesDraft.trim();
          } else {
            this.notesSaveError = true;
          }
        },
        error: () => {
          this.isSavingNotes = false;
          this.notesSaved = false;
          this.notesSaveError = true;
        },
      });
  }

  formatDuration(duration: number): string {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes} min ${seconds.toString().padStart(2, '0')} s`;
  }
}
