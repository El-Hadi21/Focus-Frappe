import { SessionStats } from '../../core/models/session-stats.model';

export type ChartMetric = 'score' | 'clearance' | 'responseTime';

export interface ChartPoint {
  x: number;
  y: number;
  valueLabel: string;
  sessionLabel: string;
  tooltip: string;
  isLast: boolean;
}

export function getChartValue(session: SessionStats, metric: ChartMetric): number {
  if (metric === 'clearance') {
    const totalObstacles = session.obstaclesCleared + session.obstaclesMissed;
    return totalObstacles === 0 ? 0 : (session.obstaclesCleared / totalObstacles) * 100;
  }

  return metric === 'responseTime' ? session.avgResponseTimeSec : session.score;
}

export function getChartMaxValue(sessions: SessionStats[], metric: ChartMetric): number {
  return Math.max(...sessions.map((session) => getChartValue(session, metric)), 1);
}

export function formatChartValue(value: number, metric: ChartMetric): string {
  if (metric === 'score') {
    return `${value.toFixed(0)} pts`;
  }

  return `${value.toFixed(1)}${metric === 'clearance' ? ' %' : ' s'}`;
}

export function getChartScaleLabels(sessions: SessionStats[], metric: ChartMetric): string[] {
  const max = getChartMaxValue(sessions, metric);
  const suffix = metric === 'score' ? ' pts' : metric === 'clearance' ? ' %' : ' s';

  return [1, 0.75, 0.5, 0.25, 0].map((ratio) => {
    const value = max * ratio;
    return `${value.toFixed(metric === 'score' ? 0 : 1)}${suffix}`;
  });
}

export function getChartPointDate(session: SessionStats): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(session.date);
}

export function getChartPointTooltip(
  session: SessionStats,
  metric: ChartMetric,
  index: number,
): string {
  return [
    `${getChartPointDate(session)} - Séance ${index + 1}`,
    `Valeur : ${formatChartValue(getChartValue(session, metric), metric)}`,
    `Palier ${session.config.difficulty}`,
    `Mode : ${session.config.mode}`,
    `Durée : ${session.config.durationSeconds}s`,
  ].join(' | ');
}

export function getChartPoints(sessions: SessionStats[], metric: ChartMetric): ChartPoint[] {
  const xStart = 42;
  const xEnd = 558;
  const yTop = 18;
  const yBottom = 138;
  const xStep = sessions.length > 1 ? (xEnd - xStart) / (sessions.length - 1) : 0;
  const max = getChartMaxValue(sessions, metric);

  return sessions.map((session, index) => {
    const value = getChartValue(session, metric);
    return {
      x: sessions.length > 1 ? xStart + index * xStep : (xStart + xEnd) / 2,
      y: yBottom - (value / max) * (yBottom - yTop),
      valueLabel: formatChartValue(value, metric),
      sessionLabel: `S${index + 1}`,
      tooltip: getChartPointTooltip(session, metric, index),
      isLast: index === sessions.length - 1,
    };
  });
}

export function getPolylinePoints(points: ChartPoint[]): string {
  return points.map(({ x, y }) => `${x},${y}`).join(' ');
}

export function getAreaPath(points: ChartPoint[]): string {
  if (points.length === 0) {
    return '';
  }

  const baseline = 138;
  const first = points[0];
  const last = points[points.length - 1];
  return `M ${first.x} ${baseline} L ${points.map(({ x, y }) => `${x} ${y}`).join(' L ')} L ${last.x} ${baseline} Z`;
}
