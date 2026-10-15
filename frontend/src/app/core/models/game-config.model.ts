export interface GameConfig {
  difficulty: 'Facile' | 'Normal' | 'Difficile';
  durationSeconds: 30 | 60 | 90 | 120 | 150 | 180;
  mode: 'Mot exact' | 'Mot à trous';
  theme: 'Football' | 'Espace';
}
