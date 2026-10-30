import { ThemeConfig } from '../../../core/models/theme-config.model';
import {
  drawCenteredSprite,
  drawFocusBackdropFilter,
  drawFocusVignette,
  drawShadow,
  drawTacticalFocusZone,
} from './canvas-draw.utils';
import { EffectsSystem } from './effects.system';
import { RenderState, SceneRenderer } from './scene-renderer.interface';

export class SpaceSceneRenderer implements SceneRenderer {
  private readonly effects = new EffectsSystem();
  private readonly sparkPalette = ['#38bdf8', '#facc15', '#f472b6', '#ffffff'];

  constructor(private readonly theme: ThemeConfig) {}

  drawScene(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    images: Record<string, HTMLImageElement>,
    state: RenderState,
  ): void {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#090d16');
    gradient.addColorStop(0.5, '#111b36');
    gradient.addColorStop(1, '#1b1438');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    this.drawStars(ctx, canvas, state.worldScrollX);

    drawFocusBackdropFilter(ctx, canvas, state);
    drawTacticalFocusZone(ctx, canvas, state, '#38bdf8', '56, 189, 248');

    const avatarY = state.avatarY + Math.sin(state.time / 180) * 6;
    drawShadow(ctx, state.avatarX, avatarY + 35, 30, 8);
    drawCenteredSprite(ctx, images[this.theme.avatarSprite], state.avatarX, avatarY, 82, 62, Math.PI / 2);

    const resolving = state.phase === 'RESOLVING_SUCCESS';
    const missed = state.phase === 'PASSING_MISSED';
    const progress = resolving || missed ? state.progress : 0;

    if (state.obstacleType === 'A') {
      const meteorX = resolving
        ? state.resolutionStartX + progress * 140
        : missed
          ? state.resolutionStartX - progress * 260
          : state.obstacleX;

      // En cas de réussite, la météorite rétrécit sous l'impact du missile laser
      const meteorScale = resolving ? Math.max(0, 1 - progress * 1.15) : 1;
      if (meteorScale > 0.05) {
        drawCenteredSprite(
          ctx,
          images[this.theme.obstacleASprite],
          meteorX,
          state.obstacleY,
          62 * meteorScale,
          62 * meteorScale,
          state.time / 280,
        );
      }

      if (resolving) {
        const laserX = state.avatarX + (meteorX - state.avatarX) * Math.min(1, progress * 2.2);
        if (progress < 0.55) {
          drawCenteredSprite(
            ctx,
            images[this.theme.projectileSprite ?? ''],
            laserX,
            state.avatarY,
            54,
            32,
            Math.PI / 2,
          );
        }
        // Explosion progressive avec le sprite spaceEffects du pack Kenney
        const explosionSize = 55 + Math.sin(progress * Math.PI) * 65;
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - progress * 0.85);
        drawCenteredSprite(
          ctx,
          images[this.theme.effectSprite ?? ''],
          meteorX,
          state.obstacleY,
          explosionSize,
          explosionSize,
          progress * 1.5,
        );
        ctx.restore();
      }
    } else {
      const rivalX = resolving
        ? state.resolutionStartX - progress * 90
        : missed
          ? state.resolutionStartX - progress * 250
          : state.obstacleX;
      const rivalY = missed ? state.obstacleY - Math.sin(progress * Math.PI) * 40 : state.obstacleY;

      drawCenteredSprite(ctx, images[this.theme.obstacleBSprite], rivalX, rivalY, 82, 62, Math.PI / 2, true);
      const starX = resolving
        ? state.resolutionStartX - 28 + (state.avatarX - (state.resolutionStartX - 28)) * progress
        : rivalX - 28;
      const starY = resolving
        ? state.obstacleY + 8 - Math.sin(progress * Math.PI) * 28
        : rivalY + 8;
      drawCenteredSprite(
        ctx,
        images[this.theme.obstacleBCarriedSprite],
        starX,
        starY,
        34,
        34,
        state.time / 220,
      );
    }

    // Étincelles et flash bref de réussite via EffectsSystem
    this.effects.updateAndDraw(ctx, canvas, state, this.sparkPalette);
    drawFocusVignette(ctx, canvas, state);
  }

  private drawStars(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, scrollX: number): void {
    for (let index = 0; index < 48; index += 1) {
      const speed = index % 2 === 0 ? 0.35 : 0.75;
      const x = (((index * 97 - scrollX * speed) % canvas.width) + canvas.width) % canvas.width;
      const y = ((index * 53) % (canvas.height - 40)) + 20;
      ctx.fillStyle = index % 5 === 0 ? '#93c5fd' : 'rgba(255, 255, 255, 0.8)';
      ctx.fillRect(x, y, index % 3 === 0 ? 3 : 2, index % 3 === 0 ? 3 : 2);
    }
  }
}
