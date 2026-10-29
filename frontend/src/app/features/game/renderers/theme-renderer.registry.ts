import { GameConfig } from '../../../core/models/game-config.model';
import { THEME_CONFIGS } from '../../../core/models/theme-config.model';
import { FootballSceneRenderer } from './football-scene.renderer';
import { SceneRenderer } from './scene-renderer.interface';
import { SpaceSceneRenderer } from './space-scene.renderer';

export function getRendererForTheme(theme: GameConfig['theme']): SceneRenderer {
  return theme === 'Football'
    ? new FootballSceneRenderer(THEME_CONFIGS.Football)
    : new SpaceSceneRenderer(THEME_CONFIGS.Espace);
}
