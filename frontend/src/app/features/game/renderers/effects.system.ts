import { RenderPhase, RenderState } from './scene-renderer.interface';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
}

export class EffectsSystem {
  private particles: Particle[] = [];
  private flashAlpha = 0;
  private lastPhase: RenderPhase = 'COUNTDOWN';
  private lastTime = 0;

  updateAndDraw(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    state: RenderState,
    palette: string[],
  ): void {
    if (state.reducedEffects) {
      this.particles = [];
      this.flashAlpha = 0;
      this.lastPhase = state.phase;
      return;
    }

    const dt = this.lastTime > 0 ? Math.min((state.time - this.lastTime) / 1000, 0.05) : 1 / 60;
    this.lastTime = state.time;

    // Déclenchement automatique à l'instant précis où le mot est validé
    if (state.phase === 'RESOLVING_SUCCESS' && this.lastPhase !== 'RESOLVING_SUCCESS') {
      this.spawnSuccessBurst(state.resolutionStartX, state.obstacleY, palette);
      this.flashAlpha = 0.28;
    } else if (state.phase === 'COUNTDOWN' || state.phase === 'APPROACHING') {
      this.particles = [];
      this.flashAlpha = 0;
    }

    this.lastPhase = state.phase;

    ctx.save();

    // Flash bref et lumineux de récompense
    if (this.flashAlpha > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${this.flashAlpha})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      this.flashAlpha = Math.max(0, this.flashAlpha - dt * 1.1);
    }

    // Mise à jour et dessin des étincelles
    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 220 * dt; // Gravité légère
      p.alpha = Math.max(0, p.alpha - dt * 1.35);

      if (p.alpha <= 0) {
        continue;
      }

      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    this.particles = this.particles.filter((p) => p.alpha > 0);
    ctx.restore();
  }

  private spawnSuccessBurst(originX: number, originY: number, palette: string[]): void {
    this.particles = Array.from({ length: 24 }, (_, index) => {
      const angle = (Math.PI * 2 * index) / 24 + (Math.random() - 0.5) * 0.25;
      const speed = 90 + Math.random() * 190;
      return {
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 50,
        size: 3 + Math.random() * 4.5,
        color: palette[index % palette.length],
        alpha: 1,
      };
    });
  }
}
