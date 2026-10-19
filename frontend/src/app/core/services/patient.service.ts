import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';

import { Patient } from '../models/patient.model';
import { SessionStats } from '../models/session-stats.model';
import { GameConfig } from '../models/game-config.model';

export interface SaveSessionData {
  sessionId?: string;
  config: GameConfig;
  responseTimesMs: number[];
  obstaclesCleared: number;
  obstaclesMissed: number;
  outOfWindowClicks: number;
  typingErrors: number;
  currentMaxStreak: number;
  playedDurationSec: number;
  abandoned: boolean;
}

export interface SaveSessionResponse {
  sessionId: string;
  session: SessionStats;
}

export interface SessionLookupResponse {
  patientId: string;
  session: SessionStats;
}

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  private readonly apiUrl = 'http://localhost:3000/api';
  private readonly currentConfigSubject = new BehaviorSubject<GameConfig | null>(null);
  readonly currentConfig$ = this.currentConfigSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  get currentConfigSnapshot(): GameConfig | null {
    return this.currentConfigSubject.value;
  }

  getPatients(): Observable<Patient[]> {
    return this.http.get<Patient[]>(`${this.apiUrl}/patients`);
  }

  setCurrentConfig(config: GameConfig): void {
    this.currentConfigSubject.next(config);
  }

  saveSession(patientId: string, sessionData: SaveSessionData): Observable<SaveSessionResponse> {
    return this.http
      .post<SaveSessionResponse>(`${this.apiUrl}/patients/${patientId}/sessions`, {
        patientId,
        ...sessionData,
      })
      .pipe(map((result) => ({ ...result, session: this.mapSession(result.session) })));
  }

  getSessionById(sessionId: string): Observable<SessionLookupResponse> {
    return this.http
      .get<SessionStats>(`${this.apiUrl}/sessions/${sessionId}`)
      .pipe(map((session) => ({ patientId: this.extractPatientId(session.id), session: this.mapSession(session) })));
  }

  getPatientById(id: string): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}/patients/${id}`);
  }

  getPatientStats(patientId: string): Observable<SessionStats[]> {
    return this.http
      .get<SessionStats[]>(`${this.apiUrl}/patients/${patientId}/sessions`)
      .pipe(map((sessions) => sessions.map((session) => this.mapSession(session))));
  }

  saveSessionNotes(patientId: string, sessionId: string, notes: string): Observable<boolean> {
    return this.http
      .patch<{ message: string; notes: string }>(
        `${this.apiUrl}/patients/${patientId}/sessions/${sessionId}/notes`,
        { notes },
      )
      .pipe(map(() => true));
  }

  addPatient(patient: Omit<Patient, 'id'>): Observable<Patient> {
    return this.http.post<Patient>(`${this.apiUrl}/patients`, patient);
  }

  deletePatient(id: string): Observable<boolean> {
    return this.http
      .delete<{ deleted: boolean }>(`${this.apiUrl}/patients/${id}`)
      .pipe(map((result) => result.deleted));
  }

  private mapSession(session: SessionStats): SessionStats {
    return {
      ...session,
      date: new Date(session.date),
    };
  }

  private extractPatientId(sessionId: string): string {
    const parts = sessionId.split('-');
    return parts.length >= 3 ? parts.slice(1, -2).join('-') : '';
  }
}
