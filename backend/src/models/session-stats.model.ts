import { GameConfig } from './game-config.model';

export interface SessionStats {
  id: string;
  date: string;
  gamesCount: number;
  config: GameConfig;
  responseTimesMs?: number[];
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
