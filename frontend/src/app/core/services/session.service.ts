import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, catchError } from 'rxjs';
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
  private readonly localFallbackSessions = new Map<string, SessionLookupResponse>();

  constructor(private readonly http: HttpClient) {}

  saveSession(patientId: string, sessionData: SaveSessionData): Observable<SaveSessionResponse> {
    return this.http
      .post<SaveSessionResponse>(`${this.API_URL}/patients/${patientId}/sessions`, {
        patientId,
        ...sessionData,
      })
      .pipe(
        map((result) => {
          const mapped = this.mapSession(result.session);
          this.localFallbackSessions.set(result.sessionId, { patientId, session: mapped });
          return { sessionId: result.sessionId, session: mapped };
        }),
      );
  }

  createLocalFallbackSession(patientId: string, data: SaveSessionData): string {
    const id = data.sessionId || `local-session-${Date.now()}`;
    const total = data.obstaclesCleared + data.obstaclesMissed;
    const rate = total > 0 ? data.obstaclesCleared / total : 0;
    const stars = data.abandoned ? 0 : rate >= 0.8 ? 3 : rate >= 0.5 ? 2 : 1;
    const avgMs =
      data.responseTimesMs.length > 0
        ? data.responseTimesMs.reduce((sum, v) => sum + v, 0) / data.responseTimesMs.length
        : 0;

    const session: SessionStats = {
      id,
      date: new Date(),
      gamesCount: 1,
      config: data.config,
      avgResponseTimeSec: avgMs / 1000,
      obstaclesCleared: data.obstaclesCleared,
      obstaclesMissed: data.obstaclesMissed,
      outOfWindowClicks: data.outOfWindowClicks,
      typingErrors: data.typingErrors,
      maxStreak: data.currentMaxStreak,
      playedDurationSec: data.playedDurationSec,
      plannedDurationSec: data.config.durationSeconds,
      abandons: data.abandoned ? 1 : 0,
      score: stars * 250,
    };

    this.localFallbackSessions.set(id, { patientId, session });
    return id;
  }

  getSessionById(sessionId: string): Observable<SessionLookupResponse> {
    const cached = this.localFallbackSessions.get(sessionId);
    if (sessionId.startsWith('local-session-') && cached) {
      return of(cached);
    }

    return this.http.get<SessionLookupResponse>(`${this.API_URL}/sessions/${sessionId}`).pipe(
      map((result) => ({ patientId: result.patientId, session: this.mapSession(result.session) })),
      catchError((err) => {
        if (cached) {
          return of(cached);
        }
        throw err;
      }),
    );
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