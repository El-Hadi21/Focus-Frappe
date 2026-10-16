import { ThemeConfig } from '../../../core/models/theme-config.model';
import { drawCenteredSprite, drawShadow, drawTacticalFocusZone } from './canvas-draw.utils';
import { SceneRenderer, RenderState } from './scene-renderer.interface';

export class FootballSceneRenderer implements SceneRenderer {
  constructor(private readonly theme: ThemeConfig) {}

  drawScene(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    images: Record<string, HTMLImageElement>,
    state: RenderState,
  ): void {
    this.drawPitch(ctx, canvas, images[this.theme.groundTile ?? ''], state.worldScrollX);
    drawTacticalFocusZone(ctx, canvas, state.focusStartX, state.focusEndX, '#facc15');
    this.drawSoccerGoal(ctx);

    const resolving = state.phase === 'RESOLVING_SUCCESS';
    const progress = resolving ? state.progress : 0;
    const avatarX = state.avatarX + (state.obstacleType === 'B' && resolving ? Math.sin(progress * Math.PI) * 95 : 0);
    const avatarY = state.avatarY + (state.obstacleType === 'B' && resolving ? 10 : 0);
    drawShadow(ctx, avatarX, avatarY + 34, 28, 10);
    drawCenteredSprite(ctx, images[this.theme.avatarSprite], avatarX, avatarY, 74, 74, 0, false);

    if (state.obstacleType === 'A') {
      const ballX = resolving ? state.resolutionStartX + (885 - state.resolutionStartX) * progress : state.obstacleX;
      const ballY = resolving ? state.obstacleY - Math.sin(progress * Math.PI) * 65 : state.obstacleY;
      drawShadow(ctx, ballX, state.obstacleY + 26, 18, 7);
      drawCenteredSprite(ctx, images[this.theme.obstacleASprite], ballX, ballY, 46, 46, state.time / 120);
    } else {
      const attackerX = resolving ? state.resolutionStartX - progress * 90 : state.obstacleX;
      const attackerY = state.obstacleY - (state.phase === 'PASSING_MISSED' ? Math.sin(progress * Math.PI) * 65 : 0);
      drawShadow(ctx, attackerX, attackerY + 34, 28, 10);
      drawCenteredSprite(ctx, images[this.theme.obstacleBSprite], attackerX, attackerY, 74, 74, 0, true);
      drawCenteredSprite(ctx, images[this.theme.obstacleBCarriedSprite], resolving ? avatarX + 28 : attackerX - 28, state.obstacleY + 14, 36, 36, -state.time / 140);
    }
  }

  private drawPitch(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    ground: HTMLImageElement | undefined,
    scrollX: number,
  ): void {
    const stripeWidth = 96;
    for (let x = -stripeWidth * 2; x < canvas.width + stripeWidth * 2; x += stripeWidth) {
      const currentX = x - (scrollX % (stripeWidth * 2));
      ctx.fillStyle = Math.floor(x / stripeWidth) % 2 === 0 ? '#27ae60' : '#2ecc71';
      ctx.fillRect(currentX, 0, stripeWidth + 1, canvas.height);
      if (ground?.complete) {
        ctx.globalAlpha = 0.2;
        ctx.drawImage(ground, currentX, canvas.height - 125, stripeWidth, 125);
        ctx.globalAlpha = 1;
      }
    }
    ctx.fillStyle = '#1e8449';
    ctx.fillRect(0, 0, canvas.width, 58);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 4;
    ctx.strokeRect(24, 72, canvas.width - 48, canvas.height - 110);
  }

  private drawSoccerGoal(ctx: CanvasRenderingContext2D): void {
    const goalX = 865;
    const goalTop = 215;
    const goalHeight = 190;
    const goalDepth = 55;
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.fillRect(goalX, goalTop, goalDepth, goalHeight);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1.5;
    for (let x = goalX; x <= goalX + goalDepth; x += 11) {
      ctx.beginPath();
      ctx.moveTo(x, goalTop);
      ctx.lineTo(x, goalTop + goalHeight);
      ctx.stroke();
    }
    for (let y = goalTop; y <= goalTop + goalHeight; y += 14) {
      ctx.beginPath();
      ctx.moveTo(goalX, y);
      ctx.lineTo(goalX + goalDepth, y);
      ctx.stroke();
    }
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.strokeRect(goalX, goalTop, goalDepth, goalHeight);
    ctx.restore();
  }
}
