import { ThemeConfig } from '../../../core/models/theme-config.model';
import {
  drawCenteredSprite,
  drawFocusBackdropFilter,
  drawFocusVignette,
  drawShadow,
  drawTacticalFocusZone,
} from './canvas-draw.utils';
import { RenderState, SceneRenderer } from './scene-renderer.interface';

export class SpaceSceneRenderer implements SceneRenderer {
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
    const progress = resolving ? state.progress : 0;

    if (state.obstacleType === 'A') {
      const meteorX = resolving ? state.resolutionStartX + progress * 260 : state.obstacleX;
      drawCenteredSprite(ctx, images[this.theme.obstacleASprite], meteorX, state.obstacleY, 62, 62, state.time / 280);
      if (resolving) {
        drawCenteredSprite(
          ctx,
          images[this.theme.projectileSprite ?? ''],
          state.avatarX + progress * 260,
          state.avatarY,
          54,
          32,
          Math.PI / 2,
        );
        drawCenteredSprite(ctx, images[this.theme.effectSprite ?? ''], meteorX, state.obstacleY, 80, 80);
      }
    } else {
      const rivalX = resolving ? state.resolutionStartX - progress * 90 : state.obstacleX;
      drawCenteredSprite(ctx, images[this.theme.obstacleBSprite], rivalX, state.obstacleY, 82, 62, Math.PI / 2, true);
      drawCenteredSprite(
        ctx,
        images[this.theme.obstacleBCarriedSprite],
        resolving ? state.avatarX : rivalX - 28,
        state.obstacleY + 8,
        32,
        32,
      );
    }

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
