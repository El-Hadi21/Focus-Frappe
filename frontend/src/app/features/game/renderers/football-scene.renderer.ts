import { ThemeConfig } from '../../../core/models/theme-config.model';
import {
  drawCenteredSprite,
  drawFocusBackdropFilter,
  drawFocusVignette,
  drawShadow,
  drawTacticalFocusZone,
} from './canvas-draw.utils';
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
    this.drawSoccerGoal(ctx);

    drawFocusBackdropFilter(ctx, canvas, state);
    drawTacticalFocusZone(ctx, canvas, state, '#facc15', '250, 204, 21');

    const resolving = state.phase === 'RESOLVING_SUCCESS';
    const missed = state.phase === 'PASSING_MISSED';
    const progress = resolving || missed ? state.progress : 0;

    // Joueur Bleu (orienté vers la droite, pose prêt / interception)
    const avatarX =
      state.avatarX + (state.obstacleType === 'B' && resolving ? Math.sin(progress * Math.PI) * 95 : 0);
    const avatarY =
      state.avatarY - (state.obstacleType === 'B' && resolving ? Math.sin(progress * Math.PI) * 18 : 0);

    drawShadow(ctx, avatarX, state.avatarY + 46, 32, 11);
    drawCenteredSprite(
      ctx,
      images[this.theme.avatarSprite],
      avatarX,
      avatarY,
      105,
      105,
      0,
      false,
      true,
    );

    if (state.obstacleType === 'A') {
      // Obstacle A : Ballon arrivant de la droite
      const ballX = resolving ? state.resolutionStartX + (885 - state.resolutionStartX) * progress : state.obstacleX;
      const ballY = resolving ? state.obstacleY - Math.sin(progress * Math.PI) * 65 : state.obstacleY + 18;
      drawShadow(ctx, ballX, state.obstacleY + 42, 18, 7);
      drawCenteredSprite(ctx, images[this.theme.obstacleASprite], ballX, ballY, 44, 44, state.time / 120);
    } else {
      // Obstacle B : Joueur Rouge (course en approche/focus -> glissade à la résolution)
      const isSliding = resolving || missed;
      const attackerSpriteKey =
        isSliding && this.theme.obstacleBSlideSprite
          ? this.theme.obstacleBSlideSprite
          : this.theme.obstacleBSprite;

      const attackerX = resolving ? state.resolutionStartX - progress * 90 : state.obstacleX;
      const attackerY = isSliding ? state.obstacleY + 12 : state.obstacleY;
      const attackerHeight = isSliding ? 88 : 105;

      drawShadow(ctx, attackerX, state.obstacleY + 46, isSliding ? 42 : 32, 11);
      // flip = false car red-player-run.png et red-player-tackle.png sont déjà orientés vers la gauche
      drawCenteredSprite(
        ctx,
        images[attackerSpriteKey],
        attackerX,
        attackerY,
        attackerHeight,
        attackerHeight,
        0,
        false,
        true,
      );

      // Ballon aux pieds de l'attaquant (ou récupéré par le joueur bleu en cas de succès)
      const carriedBallX = resolving ? avatarX + 38 : attackerX - 36;
      const carriedBallY = state.obstacleY + 28;
      drawShadow(ctx, carriedBallX, state.obstacleY + 46, 16, 6);
      drawCenteredSprite(
        ctx,
        images[this.theme.obstacleBCarriedSprite],
        carriedBallX,
        carriedBallY,
        36,
        36,
        -state.time / 140,
      );
    }

    drawFocusVignette(ctx, canvas, state);
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
