export type SessionDifficulty = 'Facile' | 'Normal' | 'Difficile';
export type SessionMode = 'Mot exact' | 'Mot à trous';
export type SessionTheme = 'Football' | 'Espace';
export type SessionDurationSeconds = 30 | 60 | 90 | 120 | 150 | 180;

export interface SessionStats {
  id: string;
  date: Date;
  gamesCount: number;
  config: {
    difficulty: SessionDifficulty;
    durationSeconds: SessionDurationSeconds;
    mode: SessionMode;
    theme: SessionTheme;
  };
  avgResponseTimeSec: number;
  variabilityMinSec?: number;
  variabilityMaxSec?: number;
  obstaclesCleared: number;
  obstaclesMissed: number;
  outOfWindowClicks: number;
  typingErrors: number;
  maxStreak: number;
  playedDurationSec: number;
  plannedDurationSec: number;
  abandons: number;
  score: number;
  notes?: string;
}
