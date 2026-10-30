export type RenderPhase =
  | 'COUNTDOWN'
  | 'APPROACHING'
  | 'FOCUS'
  | 'RESOLVING_SUCCESS'
  | 'PASSING_MISSED'
  | 'FINISHED';

export interface RenderState {
  phase: RenderPhase;
  obstacleType: 'A' | 'B';
  obstacleX: number;
  obstacleY: number;
  avatarX: number;
  avatarY: number;
  resolutionStartX: number;
  worldScrollX: number;
  time: number;
  progress: number;
  focusProgress: number;
  focusStartX: number;
  focusEndX: number;
}

export interface SceneRenderer {
  drawScene(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    images: Record<string, HTMLImageElement>,
    state: RenderState,
  ): void;
}
