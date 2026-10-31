import { ThemeConfig } from '../../../core/models/theme-config.model';
import {
  drawCenteredSprite,
  drawFocusBackdropFilter,
  drawFocusVignette,
  drawShadow,
  drawTacticalFocusZone,
} from './canvas-draw.utils';
import { EffectsSystem } from './effects.system';
import { SceneRenderer, RenderState } from './scene-renderer.interface';

export class FootballSceneRenderer implements SceneRenderer {
  private readonly effects = new EffectsSystem();
  private readonly sparkPalette = ['#facc15', '#4ade80', '#ffffff', '#38bdf8'];
  private ContinuousScrollX = 0;
  private lastScrollSample = 0;

  constructor(private readonly theme: ThemeConfig) {}

  drawScene(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    images: Record<string, HTMLImageElement>,
    state: RenderState,
  ): void {
    // Suivi continu du défilement pour éviter tout saut sur les couches lentes de parallaxe
    const deltaScroll =
      state.worldScrollX >= this.lastScrollSample
        ? state.worldScrollX - this.lastScrollSample
        : 960 - this.lastScrollSample + state.worldScrollX;
    this.lastScrollSample = state.worldScrollX;
    this.ContinuousScrollX += deltaScroll;

    const resolving = state.phase === 'RESOLVING_SUCCESS';
    const missed = state.phase === 'PASSING_MISSED';
    const progress = resolving || missed ? state.progress : 0;

    // 1. Décor en parallaxe 3 couches (Ciel -> Tribunes -> Pelouse)
    this.drawSkyAndLights(ctx, canvas, this.ContinuousScrollX * 0.15);
    this.drawStadiumStands(ctx, canvas, this.ContinuousScrollX * 0.45, state.time);
    this.drawPitch(ctx, canvas, images[this.theme.groundTile ?? ''], this.ContinuousScrollX);

    // 2. But de football 3D avec ondulation du filet si but marqué (Obstacle A)
    const netRipple = resolving && state.obstacleType === 'A' && progress > 0.7 ? Math.sin(progress * Math.PI * 6) * 6 : 0;
    this.drawSoccerGoal(ctx, netRipple);

    // 3. Mise en scène Zone de Focus
    drawFocusBackdropFilter(ctx, canvas, state);
    drawTacticalFocusZone(ctx, canvas, state, '#facc15', '250, 204, 21');

    // 4. Respiration sinusoïdale et rebond procédural du Joueur Bleu
    const breathPhase = Math.sin(state.time / 220);
    const strikeJump = resolving ? Math.sin(progress * Math.PI) * 24 : 0;
    const avatarX =
      state.avatarX + (state.obstacleType === 'B' && resolving ? Math.sin(progress * Math.PI) * 95 : 0);
    const avatarY = state.avatarY - strikeJump + breathPhase * 2.5;
    const avatarScaleX = 1 - breathPhase * 0.025 + (resolving ? Math.sin(progress * Math.PI) * 0.08 : 0);
    const avatarScaleY = 1 + breathPhase * 0.035 + (resolving ? Math.sin(progress * Math.PI) * 0.08 : 0);
    const avatarTilt = resolving ? Math.sin(progress * Math.PI) * 0.14 : 0;

    // Ombre dynamique qui se réduit quand le joueur saute
    const shadowScale = Math.max(0.65, 1 - strikeJump / 75);
    drawShadow(ctx, avatarX, state.avatarY + 46, 32 * shadowScale, 11 * shadowScale, 0.28 * shadowScale);
    drawCenteredSprite(
      ctx,
      images[this.theme.avatarSprite],
      avatarX,
      avatarY,
      105,
      105,
      avatarTilt,
      false,
      true,
      avatarScaleX,
      avatarScaleY,
    );

    // 5. Rendu des Obstacles A (Ballon) et B (Attaquant Rouge)
    if (state.obstacleType === 'A') {
      const ballX = resolving
        ? state.resolutionStartX + (892 - state.resolutionStartX) * progress
        : missed
          ? state.resolutionStartX - progress * 280
          : state.obstacleX;
      const bounceArc = resolving
        ? Math.sin(progress * Math.PI) * 75
        : Math.abs(Math.sin(state.time / 180)) * 10;
      const ballY = state.obstacleY + 18 - bounceArc;
      const ballShadowScale = Math.max(0.55, 1 - bounceArc / 110);

      drawShadow(ctx, ballX, state.obstacleY + 42, 18 * ballShadowScale, 7 * ballShadowScale);
      drawCenteredSprite(
        ctx,
        images[this.theme.obstacleASprite],
        ballX,
        ballY,
        44,
        44,
        state.time / (resolving ? 65 : 120),
      );
    } else {
      const isSliding = resolving;
      const attackerSpriteKey =
        isSliding && this.theme.obstacleBSlideSprite
          ? this.theme.obstacleBSlideSprite
          : this.theme.obstacleBSprite;

      const runBob = !isSliding ? Math.abs(Math.sin(state.time / 130)) * 7 : 0;
      const attackerScaleX = 1 + Math.sin(state.time / 190) * 0.03;
      const attackerScaleY = 1 - Math.sin(state.time / 190) * 0.03;

      const attackerX = resolving
        ? state.resolutionStartX - progress * 90
        : missed
          ? state.resolutionStartX - progress * 240
          : state.obstacleX;
      const attackerY = isSliding
        ? state.obstacleY + 12
        : missed
          ? state.obstacleY - Math.sin(progress * Math.PI) * 35
          : state.obstacleY - runBob;
      const attackerHeight = isSliding ? 88 : 105;

      drawShadow(ctx, attackerX, state.obstacleY + 46, isSliding ? 44 : 32, 11);
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
        attackerScaleX,
        attackerScaleY,
      );

      const carriedBallX = resolving ? avatarX + 38 : attackerX - 36;
      const carriedBallY = state.obstacleY + 28 - (resolving ? Math.sin(progress * Math.PI) * 14 : 0);
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

    // 6. Particules et Vignettage
    this.effects.updateAndDraw(ctx, canvas, state, this.sparkPalette);
    drawFocusVignette(ctx, canvas, state);
  }

  private drawSkyAndLights(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, slowScroll: number): void {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 115);
    skyGrad.addColorStop(0, '#0f172a');
    skyGrad.addColorStop(1, '#1e3a8a');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, 115);

    // Projecteurs de stade en parallaxe lente
    const towerSpacing = 320;
    for (let x = -towerSpacing; x < canvas.width + towerSpacing; x += towerSpacing) {
      const towerX = x - (slowScroll % towerSpacing);
      const glow = ctx.createRadialGradient(towerX, 18, 4, towerX, 18, 70);
      glow.addColorStop(0, 'rgba(254, 249, 195, 0.55)');
      glow.addColorStop(1, 'rgba(254, 249, 195, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(towerX, 18, 70, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.fillRect(towerX - 14, 10, 28, 10);
    }
  }

  private drawStadiumStands(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    midScroll: number,
    time: number,
  ): void {
    // Structure des tribunes
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 38, canvas.width, 68);

    // Rangées de sièges et silhouettes de supporters en parallaxe moyenne
    const seatSpacing = 22;
    const bannerColors = ['#3b82f6', '#ef4444', '#facc15', '#22c55e'];

    for (let row = 0; row < 2; row += 1) {
      const rowY = 52 + row * 20;
      for (let x = -seatSpacing * 2; x < canvas.width + seatSpacing * 2; x += seatSpacing) {
        const fanX = x - (midScroll % seatSpacing);
        const seed = Math.abs(Math.floor((x + row * 100) / seatSpacing));
        const wave = Math.sin(time / 260 + seed) * 2;

        ctx.fillStyle = bannerColors[seed % bannerColors.length];
        ctx.beginPath();
        ctx.arc(fanX, rowY + wave, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Bandeau publicitaire de bord de terrain
    const boardWidth = 160;
    for (let x = -boardWidth * 2; x < canvas.width + boardWidth * 2; x += boardWidth) {
      const boardX = x - (midScroll % (boardWidth * 2));
      const isAlt = Math.floor(x / boardWidth) % 2 === 0;
      ctx.fillStyle = isAlt ? '#1d4ed8' : '#0f172a';
      ctx.fillRect(boardX, 90, boardWidth, 20);
      ctx.fillStyle = isAlt ? '#93c5fd' : '#facc15';
      ctx.fillRect(boardX + 18, 97, boardWidth - 36, 6);
    }
  }

  private drawPitch(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    ground: HTMLImageElement | undefined,
    scrollX: number,
  ): void {
    const pitchTop = 110;
    const pitchHeight = canvas.height - pitchTop;
    const stripeWidth = 96;

    for (let x = -stripeWidth * 2; x < canvas.width + stripeWidth * 2; x += stripeWidth) {
      const currentX = x - (scrollX % (stripeWidth * 2));
      ctx.fillStyle = Math.floor(x / stripeWidth) % 2 === 0 ? '#27ae60' : '#2ecc71';
      ctx.fillRect(currentX, pitchTop, stripeWidth + 1, pitchHeight);
      if (ground?.complete) {
        ctx.globalAlpha = 0.18;
        ctx.drawImage(ground, currentX, canvas.height - 125, stripeWidth, 125);
        ctx.globalAlpha = 1;
      }
    }

    // Lignes blanches du terrain et surface de réparation
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 4;
    ctx.strokeRect(24, pitchTop + 14, canvas.width - 48, pitchHeight - 34);

    // Surface de réparation devant le but à droite
    ctx.strokeRect(canvas.width - 175, 190, 151, 240);
    ctx.restore();
  }

  private drawSoccerGoal(ctx: CanvasRenderingContext2D, netRipple = 0): void {
    const goalX = 858;
    const goalTop = 205;
    const goalHeight = 205;
    const goalDepth = 64 + netRipple;

    ctx.save();

    // Ombre au sol de la cage
    ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
    ctx.beginPath();
    ctx.moveTo(goalX, goalTop + goalHeight);
    ctx.lineTo(goalX + goalDepth + 12, goalTop + goalHeight - 10);
    ctx.lineTo(goalX + goalDepth, goalTop + goalHeight + 10);
    ctx.lineTo(goalX - 6, goalTop + goalHeight + 10);
    ctx.closePath();
    ctx.fill();

    // Fond translucide du filet
    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.beginPath();
    ctx.moveTo(goalX, goalTop);
    ctx.lineTo(goalX + goalDepth, goalTop + 14);
    ctx.lineTo(goalX + goalDepth, goalTop + goalHeight - 14);
    ctx.lineTo(goalX, goalTop + goalHeight);
    ctx.closePath();
    ctx.fill();

    // Maillage du filet avec effet de profondeur et ondulation
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.48)';
    ctx.lineWidth = 1.4;
    for (let x = goalX + 10; x <= goalX + goalDepth; x += 10) {
      ctx.beginPath();
      ctx.moveTo(x, goalTop + ((x - goalX) / goalDepth) * 14);
      ctx.lineTo(x + netRipple * 0.4, goalTop + goalHeight - ((x - goalX) / goalDepth) * 14);
      ctx.stroke();
    }
    for (let y = goalTop + 14; y < goalTop + goalHeight; y += 14) {
      ctx.beginPath();
      ctx.moveTo(goalX, y);
      ctx.lineTo(goalX + goalDepth, y + netRipple * 0.3);
      ctx.stroke();
    }

    // Arceaux métalliques arrières
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(goalX, goalTop);
    ctx.lineTo(goalX + goalDepth, goalTop + 14);
    ctx.lineTo(goalX + goalDepth, goalTop + goalHeight - 14);
    ctx.lineTo(goalX, goalTop + goalHeight);
    ctx.stroke();

    // Poteaux principaux au premier plan avec relief
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(goalX, goalTop);
    ctx.lineTo(goalX, goalTop + goalHeight);
    ctx.moveTo(goalX, goalTop);
    ctx.lineTo(goalX + 18, goalTop - 6);
    ctx.stroke();

    ctx.restore();
  }
}
