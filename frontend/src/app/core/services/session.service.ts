import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { GameConfig } from '../models/game-config.model';
import { SessionStats } from '../models/session-stats.model';

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
export class SessionService {
  private readonly API_URL = 'http://localhost:3000/api';

  constructor(private readonly http: HttpClient) {}

  saveSession(patientId: string, sessionData: SaveSessionData): Observable<SaveSessionResponse> {
    return this.http
      .post<SaveSessionResponse>(`${this.API_URL}/patients/${patientId}/sessions`, {
        patientId,
        ...sessionData,
      })
      .pipe(map((result) => ({ ...result, session: this.mapSession(result.session) })));
  }

  getSessionById(sessionId: string): Observable<SessionLookupResponse> {
    return this.http
      .get<SessionLookupResponse>(`${this.API_URL}/sessions/${sessionId}`)
      .pipe(map((result) => ({ patientId: result.patientId, session: this.mapSession(result.session) })));
  }

  getPatientStats(patientId: string): Observable<SessionStats[]> {
    return this.http
      .get<SessionStats[]>(`${this.API_URL}/patients/${patientId}/sessions`)
      .pipe(map((sessions) => sessions.map((session) => this.mapSession(session))));
  }

  saveSessionNotes(patientId: string, sessionId: string, notes: string): Observable<boolean> {
    return this.http
      .patch<{ message: string; notes: string }>(
        `${this.API_URL}/patients/${patientId}/sessions/${sessionId}/notes`,
        { notes },
      )
      .pipe(map(() => true));
  }

  private mapSession(session: SessionStats): SessionStats {
    return {
      ...session,
      date: new Date(session.date),
    };
  }

}
