export interface VariabilityResult {
  avgSec: number;
  minSec?: number;
  maxSec?: number;
}

export interface GameScoreResult {
  stars: number;
  score: number;
}

export function calculateVariability(
  responseTimesMs: number[],
  obstaclesCleared: number,
): VariabilityResult {
  const avgMs = responseTimesMs.length === 0
    ? 0
    : responseTimesMs.reduce((sum, value) => sum + value, 0) / responseTimesMs.length;
  const avgSec = avgMs / 1000;

  if (obstaclesCleared < 10 || responseTimesMs.length === 0) {
    return { avgSec };
  }

  const variance = responseTimesMs.reduce(
    (sum, value) => sum + (value - avgMs) ** 2,
    0,
  ) / responseTimesMs.length;
  const standardDeviationSec = Math.sqrt(variance) / 1000;

  return {
    avgSec,
    minSec: avgSec - standardDeviationSec,
    maxSec: avgSec + standardDeviationSec,
  };
}

export function calculateGameScore(
  cleared: number,
  missed: number,
  abandoned: boolean,
): GameScoreResult {
  if (abandoned) {
    return { stars: 0, score: 0 };
  }

  const total = cleared + missed;
  const clearanceRate = total === 0 ? 0 : cleared / total;
  const stars = clearanceRate >= 0.8 ? 3 : clearanceRate >= 0.5 ? 2 : 1;

  return { stars, score: stars * 250 };
}
