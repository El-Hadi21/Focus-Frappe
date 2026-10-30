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
  private continuousScrollX = 0;
  private lastScrollSample = 0;

  constructor(private readonly theme: ThemeConfig) {}

  drawScene(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    images: Record<string, HTMLImageElement>,
    state: RenderState,
  ): void {
    const deltaScroll =
      state.worldScrollX >= this.lastScrollSample
        ? state.worldScrollX - this.lastScrollSample
        : 960 - this.lastScrollSample + state.worldScrollX;
    this.lastScrollSample = state.worldScrollX;
    this.continuousScrollX += deltaScroll;

    // 1. Fond cosmique et parallaxe 3 couches (Nébuleuse + Étoiles + Planètes + Station)
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#060913');
    gradient.addColorStop(0.5, '#0f172a');
    gradient.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    this.drawNebulaAndPlanets(ctx, canvas, this.continuousScrollX);
    this.drawParallaxStars(ctx, canvas, this.continuousScrollX, state.time);

    // Station spatiale Kenney en couche intermédiaire
    const stationImg = images[this.theme.groundTile ?? ''];
    if (stationImg?.complete) {
      const stationX =
        ((820 - this.continuousScrollX * 0.28) % (canvas.width + 240) + (canvas.width + 240)) %
          (canvas.width + 240) -
        120;
      ctx.save();
      ctx.globalAlpha = 0.32;
      drawCenteredSprite(ctx, stationImg, stationX, 125, 96, 96, state.time / 2400);
      ctx.restore();
    }

    // 2. Mise en scène Zone de Focus
    drawFocusBackdropFilter(ctx, canvas, state);
    drawTacticalFocusZone(ctx, canvas, state, '#38bdf8', '56, 189, 248');

    const resolving = state.phase === 'RESOLVING_SUCCESS';
    const missed = state.phase === 'PASSING_MISSED';
    const progress = resolving || missed ? state.progress : 0;

    // 3. Respiration sinusoïdale et impulsion du vaisseau joueur
    const hoverOffset = Math.sin(state.time / 180) * 7;
    const thrustBoost = resolving ? Math.sin(progress * Math.PI) * 18 : 0;
    const shipScaleX =
      1 + Math.sin(state.time / 210) * 0.03 + (resolving ? Math.sin(progress * Math.PI) * 0.08 : 0);
    const shipScaleY =
      1 - Math.sin(state.time / 210) * 0.025 + (resolving ? Math.sin(progress * Math.PI) * 0.06 : 0);
    const avatarX = state.avatarX + thrustBoost;
    const avatarY = state.avatarY + hoverOffset;

    // Halo de propulseur réactif derrière le vaisseau
    this.drawThrusterGlow(ctx, avatarX - 38, avatarY, resolving ? 1.45 : 1, state.time);

    const shadowScale = Math.max(0.7, 1 - (hoverOffset + 7) / 45);
    drawShadow(ctx, avatarX, state.avatarY + 42, 30 * shadowScale, 8 * shadowScale, 0.32);
    drawCenteredSprite(
      ctx,
      images[this.theme.avatarSprite],
      avatarX,
      avatarY,
      82,
      62,
      Math.PI / 2,
      false,
      false,
      shipScaleX,
      shipScaleY,
    );

    // 4. Obstacles A (Météorite) et B (Vaisseau rival)
    if (state.obstacleType === 'A') {
      const meteorX = resolving
        ? state.resolutionStartX + progress * 140
        : missed
          ? state.resolutionStartX - progress * 260
          : state.obstacleX;

      const meteorScale = resolving ? Math.max(0, 1 - progress * 1.15) : 1 + Math.sin(state.time / 200) * 0.04;
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
        const laserX = avatarX + (meteorX - avatarX) * Math.min(1, progress * 2.2);
        if (progress < 0.55) {
          drawCenteredSprite(
            ctx,
            images[this.theme.projectileSprite ?? ''],
            laserX,
            avatarY,
            54,
            32,
            Math.PI / 2,
          );
        }
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
      const rivalHover = Math.cos(state.time / 170) * 5;
      const rivalY =
        (missed ? state.obstacleY - Math.sin(progress * Math.PI) * 40 : state.obstacleY) + rivalHover;
      const rivalScale = 1 + Math.sin(state.time / 190) * 0.035;

      drawCenteredSprite(
        ctx,
        images[this.theme.obstacleBSprite],
        rivalX,
        rivalY,
        82,
        62,
        Math.PI / 2,
        true,
        false,
        rivalScale,
        rivalScale,
      );

      const starX = resolving
        ? state.resolutionStartX - 28 + (avatarX - (state.resolutionStartX - 28)) * progress
        : rivalX - 28;
      const starY = resolving
        ? state.obstacleY + 8 - Math.sin(progress * Math.PI) * 28
        : rivalY + 8;
      const starPulse = 1 + Math.sin(state.time / 140) * 0.1;
      drawCenteredSprite(
        ctx,
        images[this.theme.obstacleBCarriedSprite],
        starX,
        starY,
        34,
        34,
        state.time / 220,
        false,
        false,
        starPulse,
        starPulse,
      );
    }

    // 5. Particules et Vignettage
    this.effects.updateAndDraw(ctx, canvas, state, this.sparkPalette);
    drawFocusVignette(ctx, canvas, state);
  }

  private drawNebulaAndPlanets(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    scrollX: number,
  ): void {
    ctx.save();

    // Nébuleuse lointaine (couche 0.12x)
    const nebulaX =
      ((520 - scrollX * 0.12) % (canvas.width + 300) + (canvas.width + 300)) % (canvas.width + 300) - 150;
    const nebulaGrad = ctx.createRadialGradient(nebulaX, 220, 20, nebulaX, 220, 220);
    nebulaGrad.addColorStop(0, 'rgba(56, 189, 248, 0.14)');
    nebulaGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.08)');
    nebulaGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = nebulaGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Planète à anneaux en parallaxe (couche 0.22x)
    const planetX =
      ((740 - scrollX * 0.22) % (canvas.width + 260) + (canvas.width + 260)) % (canvas.width + 260) - 130;
    const planetY = 415;

    const planetGrad = ctx.createRadialGradient(planetX - 12, planetY - 12, 8, planetX, planetY, 44);
    planetGrad.addColorStop(0, '#c084fc');
    planetGrad.addColorStop(0.6, '#6366f1');
    planetGrad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = planetGrad;
    ctx.beginPath();
    ctx.arc(planetX, planetY, 42, 0, Math.PI * 2);
    ctx.fill();

    // Anneau planétaire incliné
    ctx.strokeStyle = 'rgba(147, 197, 253, 0.38)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(planetX, planetY, 72, 16, -0.28, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  private drawParallaxStars(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    scrollX: number,
    time: number,
  ): void {
    for (let index = 0; index < 64; index += 1) {
      const layer = index % 3;
      const speed = layer === 0 ? 0.2 : layer === 1 ? 0.5 : 0.9;
      const size = layer === 0 ? 1.5 : layer === 1 ? 2.5 : 3.5;
      const x = (((index * 97 - scrollX * speed) % canvas.width) + canvas.width) % canvas.width;
      const y = ((index * 53) % (canvas.height - 40)) + 20;
      const twinkle = 0.55 + 0.45 * Math.sin(time / 320 + index);

      ctx.fillStyle =
        index % 6 === 0
          ? `rgba(147, 197, 253, ${twinkle})`
          : index % 9 === 0
            ? `rgba(253, 224, 71, ${twinkle})`
            : `rgba(255, 255, 255, ${twinkle})`;
      ctx.fillRect(x, y, size, size);
    }
  }

  private drawThrusterGlow(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    boost: number,
    time: number,
  ): void {
    ctx.save();
    const radius = (16 + Math.sin(time / 60) * 4) * boost;
    const glow = ctx.createRadialGradient(x, y, 2, x, y, radius);
    glow.addColorStop(0, 'rgba(254, 240, 138, 0.9)');
    glow.addColorStop(0.5, 'rgba(56, 189, 248, 0.55)');
    glow.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
