import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { Patient } from '../models/patient.model';
import { SessionStats } from '../models/session-stats.model';
import { GameConfig } from '../models/game-config.model';

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  private readonly currentConfigSubject = new BehaviorSubject<GameConfig | null>(null);
  readonly currentConfig$ = this.currentConfigSubject.asObservable();

  private readonly statsByPatient: Record<string, SessionStats[]> = {
    'patient-leo': [
      {
        id: 'session-leo-01',
        date: new Date('2026-09-15T16:00:00'),
        gamesCount: 3,
        config: { difficulty: 'Facile', durationSeconds: 60, mode: 'Mot exact', theme: 'Football' },
        avgResponseTimeSec: 3.4,
        variabilityMinSec: 2.5,
        variabilityMaxSec: 4.3,
        obstaclesCleared: 8,
        obstaclesMissed: 4,
        outOfWindowClicks: 6,
        typingErrors: 9,
        maxStreak: 5,
        playedDurationSec: 150,
        plannedDurationSec: 180,
        abandons: 1,
        score: 500,
        notes: 'Bonne compréhension de la consigne, attention fluctuante en fin de séance.',
      },
      {
        id: 'session-leo-02',
        date: new Date('2026-09-24T16:15:00'),
        gamesCount: 4,
        config: { difficulty: 'Facile', durationSeconds: 90, mode: 'Mot à trous', theme: 'Espace' },
        avgResponseTimeSec: 3.1,
        variabilityMinSec: 2.4,
        variabilityMaxSec: 3.8,
        obstaclesCleared: 11,
        obstaclesMissed: 4,
        outOfWindowClicks: 5,
        typingErrors: 8,
        maxStreak: 7,
        playedDurationSec: 270,
        plannedDurationSec: 360,
        abandons: 1,
        score: 750,
      },
      {
        id: 'session-leo-03',
        date: new Date('2026-10-02T15:45:00'),
        gamesCount: 5,
        config: { difficulty: 'Normal', durationSeconds: 90, mode: 'Mot exact', theme: 'Football' },
        avgResponseTimeSec: 2.9,
        variabilityMinSec: 2.2,
        variabilityMaxSec: 3.6,
        obstaclesCleared: 13,
        obstaclesMissed: 3,
        outOfWindowClicks: 4,
        typingErrors: 6,
        maxStreak: 9,
        playedDurationSec: 390,
        plannedDurationSec: 450,
        abandons: 0,
        score: 1000,
      },
      {
        id: 'session-leo-04',
        date: new Date('2026-10-08T16:30:00'),
        gamesCount: 5,
        config: { difficulty: 'Normal', durationSeconds: 120, mode: 'Mot à trous', theme: 'Espace' },
        avgResponseTimeSec: 2.6,
        variabilityMinSec: 2,
        variabilityMaxSec: 3.2,
        obstaclesCleared: 16,
        obstaclesMissed: 3,
        outOfWindowClicks: 3,
        typingErrors: 5,
        maxStreak: 11,
        playedDurationSec: 510,
        plannedDurationSec: 600,
        abandons: 0,
        score: 1250,
        notes: 'Progression régulière et meilleure tolérance aux mots à trous.',
      },
      {
        id: 'session-leo-05',
        date: new Date('2026-10-13T14:30:00'),
        gamesCount: 5,
        config: { difficulty: 'Difficile', durationSeconds: 120, mode: 'Mot exact', theme: 'Football' },
        avgResponseTimeSec: 2.4,
        variabilityMinSec: 1.8,
        variabilityMaxSec: 3,
        obstaclesCleared: 14,
        obstaclesMissed: 2,
        outOfWindowClicks: 2,
        typingErrors: 4,
        maxStreak: 10,
        playedDurationSec: 540,
        plannedDurationSec: 600,
        abandons: 0,
        score: 1500,
        notes: 'Léo reste concentré et gagne en vitesse. Les erreurs surviennent surtout lors des changements de rythme.',
      },
    ],
    'patient-ines': [],
  };

  private readonly patientsSubject = new BehaviorSubject<Patient[]>([
    {
      id: 'patient-leo',
      firstName: 'Léo',
      lastName: 'Martin',
      age: 8,
      dysgraphiaSeverity: 'Légère',
      attentionProfile: 'Inattentif',
    },
    {
      id: 'patient-ines',
      firstName: 'Inès',
      lastName: 'Bernard',
      age: 10,
      dysgraphiaSeverity: 'Modérée',
      attentionProfile: 'Mixte',
    },
    {
      id: 'patient-noah',
      firstName: 'Noah',
      lastName: 'Petit',
      age: 9,
      dysgraphiaSeverity: 'Sévère',
      attentionProfile: 'Hyperactif',
    },
  ]);

  getPatients(): Observable<Patient[]> {
    return this.patientsSubject.asObservable();
  }

  setCurrentConfig(config: GameConfig): void {
    this.currentConfigSubject.next(config);
  }

  getPatientById(id: string): Patient | undefined {
    return this.patientsSubject.value.find((patient) => patient.id === id);
  }

  getPatientStats(patientId: string): Observable<SessionStats[]> {
    return of(this.statsByPatient[patientId] ?? []).pipe(delay(800));
  }

  saveSessionNotes(patientId: string, sessionId: string, notes: string): Observable<boolean> {
    const session = this.statsByPatient[patientId]?.find((item) => item.id === sessionId);

    if (!session) {
      return of(false).pipe(delay(300));
    }

    session.notes = notes;
    return of(true).pipe(delay(300));
  }

  addPatient(patient: Omit<Patient, 'id'>): Observable<boolean> {
    const newPatient: Patient = {
      ...patient,
      id: `patient-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    };

    this.patientsSubject.next([...this.patientsSubject.value, newPatient]);

    return of(true).pipe(delay(500));
  }
  deletePatient(id: string): Observable<boolean> {
       const currentPatients = this.patientsSubject.value;
       const updatedPatients = currentPatients.filter((p) => p.id !== id);
       this.patientsSubject.next(updatedPatients);

       // Simulation du délai réseau
       return of(true).pipe(delay(500));
     }
}
