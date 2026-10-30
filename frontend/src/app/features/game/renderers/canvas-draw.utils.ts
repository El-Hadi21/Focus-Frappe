import { RenderState } from './scene-renderer.interface';

export function drawCenteredSprite(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement | undefined,
  x: number,
  y: number,
  width: number,
  height: number,
  rotation = 0,
  flip = false,
  preserveAspectRatio = false,
  scaleX = 1,
  scaleY = 1,
): void {
  if (!image?.complete || image.naturalWidth === 0 || image.naturalHeight === 0) {
    return;
  }

  let drawWidth = width;
  let drawHeight = height;

  if (preserveAspectRatio) {
    const aspect = image.naturalWidth / image.naturalHeight;
    drawHeight = height;
    drawWidth = height * aspect;
  }

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.scale((flip ? -1 : 1) * scaleX, scaleY);
  ctx.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
  ctx.restore();
}

export function drawShadow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  alpha = 0.25,
): void {
  ctx.save();
  ctx.fillStyle = `rgba(15, 23, 42, ${alpha})`;
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(4, width), Math.max(2, height), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawFocusBackdropFilter(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  state: RenderState,
): void {
  if (state.phase !== 'FOCUS') {
    return;
  }
  ctx.save();
  ctx.fillStyle = 'rgba(30, 41, 59, 0.22)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}

export function drawTacticalFocusZone(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  state: RenderState,
  accentHex: string,
  accentRgb: string,
): void {
  ctx.save();

  if (state.phase === 'APPROACHING') {
    const lineGradient = ctx.createLinearGradient(0, 110, 0, canvas.height - 50);
    lineGradient.addColorStop(0, `rgba(${accentRgb}, 0)`);
    lineGradient.addColorStop(0.5, `rgba(${accentRgb}, 0.45)`);
    lineGradient.addColorStop(1, `rgba(${accentRgb}, 0)`);

    ctx.strokeStyle = lineGradient;
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(state.focusStartX, 115);
    ctx.lineTo(state.focusStartX, canvas.height - 55);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    return;
  }

  if (state.phase !== 'FOCUS') {
    ctx.restore();
    return;
  }

  const remainingRatio = Math.max(0.15, 1 - state.focusProgress);
  const outerRadius = 54 + remainingRatio * 68;
  const innerRadius = 24;

  const haloGradient = ctx.createRadialGradient(
    state.obstacleX,
    state.obstacleY,
    innerRadius,
    state.obstacleX,
    state.obstacleY,
    outerRadius,
  );
  haloGradient.addColorStop(0, `rgba(${accentRgb}, 0.38)`);
  haloGradient.addColorStop(0.65, `rgba(${accentRgb}, 0.16)`);
  haloGradient.addColorStop(1, `rgba(${accentRgb}, 0)`);

  ctx.fillStyle = haloGradient;
  ctx.beginPath();
  ctx.arc(state.obstacleX, state.obstacleY, outerRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = accentHex;
  ctx.globalAlpha = 0.78;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(state.obstacleX, state.obstacleY, 38 + remainingRatio * 44, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

export function drawFocusVignette(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  state: RenderState,
): void {
  if (state.phase !== 'FOCUS') {
    return;
  }

  ctx.save();
  const centerX = canvas.width * 0.48;
  const centerY = canvas.height * 0.56;
  const innerRadius = canvas.height * 0.34;
  const outerRadius = canvas.width * 0.68;

  const vignette = ctx.createRadialGradient(
    centerX,
    centerY,
    innerRadius,
    centerX,
    centerY,
    outerRadius,
  );
  vignette.addColorStop(0, 'rgba(15, 23, 42, 0)');
  vignette.addColorStop(0.65, 'rgba(15, 23, 42, 0.18)');
  vignette.addColorStop(1, 'rgba(15, 23, 42, 0.52)');

  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}
