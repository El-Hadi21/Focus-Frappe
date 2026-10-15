import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GameTelemetryService {
  obstaclesCleared = 0;
  obstaclesMissed = 0;
  outOfWindowClicks = 0;
  typingErrors = 0;
  currentStreak = 0;
  maxStreak = 0;
  responseTimesMs: number[] = [];

  reset(): void {
    this.obstaclesCleared = 0;
    this.obstaclesMissed = 0;
    this.outOfWindowClicks = 0;
    this.typingErrors = 0;
    this.currentStreak = 0;
    this.maxStreak = 0;
    this.responseTimesMs = [];
  }

  recordSuccess(responseTimeMs: number): void {
    this.obstaclesCleared += 1;
    this.currentStreak += 1;
    this.maxStreak = Math.max(this.maxStreak, this.currentStreak);
    this.responseTimesMs.push(Math.max(150, responseTimeMs));
  }

  recordMiss(): void {
    this.obstaclesMissed += 1;
    this.currentStreak = 0;
  }

  recordEarlyPress(): void {
    this.outOfWindowClicks += 1;
  }

  recordTypingError(): void {
    this.typingErrors += 1;
  }

  getStars(totalObstacles: number): 1 | 2 | 3 {
    const rate = totalObstacles ? this.obstaclesCleared / totalObstacles : 0;
    return rate >= 0.8 ? 3 : rate >= 0.5 ? 2 : 1;
  }

  getScore(totalObstacles: number): number {
    return this.getStars(totalObstacles) * 250;
  }

  get averageResponseTimeSeconds(): number {
    if (!this.responseTimesMs.length) {
      return 0;
    }
    return this.responseTimesMs.reduce((sum, value) => sum + value, 0) / this.responseTimesMs.length / 1000;
  }
}
