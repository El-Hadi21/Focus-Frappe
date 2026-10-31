export type SessionDifficulty = 'Facile' | 'Normal' | 'Difficile';
export type SessionMode = 'Mot exact' | 'Mot à trous';
export type SessionTheme = 'Football' | 'Espace';
export type SessionDurationSeconds = 30 | 60 | 90 | 120 | 150 | 180;

export interface GameConfig {
  difficulty: SessionDifficulty;
  durationSeconds: SessionDurationSeconds;
  mode: SessionMode;
  theme: SessionTheme;
  reducedEffects?: boolean;
}
