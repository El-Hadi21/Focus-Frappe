export function drawCenteredSprite(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement | undefined,
  x: number,
  y: number,
  width: number,
  height: number,
  rotation = 0,
  flip = false,
): void {
  if (!image?.complete || image.naturalWidth === 0) {
    return;
  }

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  if (flip) {
    ctx.scale(-1, 1);
  }
  ctx.drawImage(image, -width / 2, -height / 2, width, height);
  ctx.restore();
}

export function drawShadow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
  ctx.beginPath();
  ctx.ellipse(x, y, width, height, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawTacticalFocusZone(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  startX: number,
  endX: number,
  color: string,
): void {
  ctx.save();
  ctx.fillStyle = `${color}22`;
  ctx.fillRect(endX, 75, startX - endX, canvas.height - 155);
  ctx.strokeStyle = `${color}aa`;
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 8]);
  ctx.strokeRect(endX, 75, startX - endX, canvas.height - 155);
  ctx.setLineDash([]);
  ctx.restore();
}
