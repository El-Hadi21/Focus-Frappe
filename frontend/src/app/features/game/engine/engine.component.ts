import { DecimalPipe } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameConfig } from '../../../core/models/game-config.model';
import { Patient } from '../../../core/models/patient.model';
import { THEME_CONFIGS, ThemeConfig } from '../../../core/models/theme-config.model';
import { GameConfigService } from '../../../core/services/game-config.service';
import { PatientService } from '../../../core/services/patient.service';
import { SessionService } from '../../../core/services/session.service';
import { RenderPhase, SceneRenderer } from '../renderers/scene-renderer.interface';
import { getRendererForTheme } from '../renderers/theme-renderer.registry';
import { ClinicalDefaultsService } from '../services/clinical-defaults.service';
import { GameTelemetryService } from '../services/game-telemetry.service';
import { WordChallengeService, WordLetterTile } from '../services/word-challenge.service';

type ObstacleType = 'A' | 'B';

@Component({
  selector: 'app-engine',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './engine.component.html',
  styleUrl: './engine.component.scss',
})
export class EngineComponent implements AfterViewInit, OnDestroy {
  @ViewChild('gameCanvas') private canvasRef?: ElementRef<HTMLCanvasElement>;
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly patientService = inject(PatientService);
  private readonly gameConfigService = inject(GameConfigService);
  private readonly sessionService = inject(SessionService);
  private readonly clinicalDefaultsService = inject(ClinicalDefaultsService);
  private readonly wordService = inject(WordChallengeService);
  readonly telemetry = inject(GameTelemetryService);
  readonly themes: GameConfig['theme'][] = ['Football', 'Espace'];
  readonly themeConfigs = THEME_CONFIGS;
  readonly phaseLabels: Record<RenderPhase | 'SELECT_THEME', string> = {
    SELECT_THEME: 'Choisis ton univers !', COUNTDOWN: 'Prépare tes mains...',
    APPROACHING: 'Obstacle en approche...', FOCUS: 'ZONE DE FOCUS : Tape le mot !',
    RESOLVING_SUCCESS: 'Super frappe !', PASSING_MISSED: 'Regarde bien le mot :', FINISHED: 'Partie terminée !',
  };
  patient?: Patient;
  config!: GameConfig;
  selectedTheme: GameConfig['theme'] = 'Football';
  phase: RenderPhase | 'SELECT_THEME' = 'SELECT_THEME';
  currentObstacle = 0;
  totalObstacles = 3;
  focusProgress = 0;
  obstacleType: ObstacleType = 'A';
  targetWord = '';
  letterTiles: WordLetterTile[] = [];
  hasTypoShake = false;
  hasSoftErrorTile = false;
  hasEarlyPressWarning = false;
  isLoadingTheme = false;
  countdownValue = 3;
  private context?: CanvasRenderingContext2D;
  private frame?: number;
  private lastFrameTime = 0;
  private visibilityPauseStartedAt = 0;
  private isPausedByVisibility = false;
  private phaseStartedAt = 0;
  private focusEnteredAt = 0;
  private obstacleX = 980;
  private obstacleY = 310;
  private resolutionStartX = 400;
  private worldScrollX = 0;
  private gameStartedAt = 0;
  private images: Record<string, HTMLImageElement> = {};
  private renderer!: SceneRenderer;
  private isSavingSession = false;
  private readonly focusStartX = 640;
  private readonly focusEndX = 250;

  get obstaclesCleared(): number { return this.telemetry.obstaclesCleared; }
  get obstaclesMissed(): number { return this.telemetry.obstaclesMissed; }
  get outOfWindowClicks(): number { return this.telemetry.outOfWindowClicks; }
  get typingErrors(): number { return this.telemetry.typingErrors; }
  get currentStreak(): number { return this.telemetry.currentStreak; }
  get responseTimesMs(): number[] { return this.telemetry.responseTimesMs; }
  get avgResponseTimeSeconds(): number { return this.telemetry.averageResponseTimeSeconds; }
  get focusDurationSeconds(): number { return this.config?.difficulty === 'Facile' ? 7 : this.config?.difficulty === 'Difficile' ? 4 : 5.5; }
  get focusRemainingPercent(): number { return this.phase === 'FOCUS' ? Math.max(0, Math.round((1 - this.focusProgress) * 100)) : this.phase === 'APPROACHING' ? 100 : 0; }
  get countdownLabel(): string { return this.countdownValue > 0 ? String(this.countdownValue) : 'C’est parti !'; }

  ngAfterViewInit(): void {
    const id = this.route.snapshot.paramMap.get('patientId');
    if (!id) { void this.router.navigate(['/dashboard']); return; }
    this.patientService.getPatientById(id).subscribe({
      next: (patient) => {
        this.patient = patient;
        this.config = this.gameConfigService.getConfigForPatient(patient.id)
          ?? this.gameConfigService.currentConfigSnapshot
          ?? this.clinicalDefaultsService.getDefaultConfig(patient);
        this.selectedTheme = this.config.theme;
        this.totalObstacles = Math.max(3, Math.round(this.config.durationSeconds / 10));
        if (this.route.snapshot.queryParamMap.get('autostart') === 'true') {
          void this.selectThemeAndStart(this.selectedTheme);
        }
      },
      error: () => void this.router.navigate(['/dashboard']),
    });
  }

  ngOnDestroy(): void { this.stopLoop(); }

  @HostListener('window:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (event.key.length !== 1 || event.ctrlKey || event.altKey || event.metaKey) return;
    const char = event.key.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    if (!/^[a-z]$/.test(char)) return;
    event.preventDefault();
    if (this.phase !== 'FOCUS') {
      if (this.phase === 'APPROACHING') { this.telemetry.recordEarlyPress(); this.hasEarlyPressWarning = true; }
      return;
    }
    const result = this.wordService.checkCharacter(char);
    this.letterTiles = this.wordService.getTiles();
    if (result === 'complete') {
      this.hasSoftErrorTile = false;
      this.success(performance.now());
    } else if (result === 'correct') {
      this.hasSoftErrorTile = false;
    } else if (result === 'incorrect') {
      this.telemetry.recordTypingError();
      this.hasSoftErrorTile = true;
      setTimeout(() => {
        this.hasSoftErrorTile = false;
      }, 320);
    }
  }

  @HostListener('document:visibilitychange')
  handleVisibilityChange(): void {
    const isGameInProgress = this.phase !== 'SELECT_THEME' && this.phase !== 'FINISHED';

    if (document.hidden) {
      if (isGameInProgress && !this.isPausedByVisibility) {
        this.isPausedByVisibility = true;
        this.visibilityPauseStartedAt = performance.now();
        this.stopLoop();
      }
      return;
    }

    if (!this.isPausedByVisibility) {
      return;
    }

    const resumedAt = performance.now();
    const pausedDuration = resumedAt - this.visibilityPauseStartedAt;
    this.lastFrameTime = resumedAt;
    this.phaseStartedAt += pausedDuration;
    this.focusEnteredAt += pausedDuration;
    this.gameStartedAt += pausedDuration;
    this.isPausedByVisibility = false;

    if (isGameInProgress) {
      this.frame = requestAnimationFrame((time) => this.render(time));
    }
  }

  async selectThemeAndStart(theme: GameConfig['theme']): Promise<void> {
    if (this.isLoadingTheme || !this.patient) return;
    this.isLoadingTheme = true;
    this.selectedTheme = theme;
    this.config = { ...this.config, theme };
    this.gameConfigService.setConfigForPatient(this.patient.id, this.config);
    await this.wordService.loadDictionaries();
    this.images = await this.preloadTheme(THEME_CONFIGS[theme]);
    this.renderer = getRendererForTheme(theme);
    this.isLoadingTheme = false;
    this.startGame();
  }

  replaySameTheme(): void { void this.selectThemeAndStart(this.selectedTheme); }
  openThemeSelection(): void { this.stopLoop(); this.phase = 'SELECT_THEME'; }
  quitToProfile(): void {
    if (!this.patient) {
      return;
    }

    if ((this.phase === 'APPROACHING' || this.phase === 'FOCUS') && !this.isSavingSession) {
      this.isSavingSession = true;
      this.phase = 'FINISHED';
      this.stopLoop();
      const sessionId = this.route.snapshot.queryParamMap.get('sessionId') ?? undefined;
      this.sessionService.saveSession(this.patient.id, {
        sessionId,
        config: this.config,
        responseTimesMs: this.responseTimesMs,
        obstaclesCleared: this.telemetry.obstaclesCleared,
        obstaclesMissed: this.telemetry.obstaclesMissed,
        outOfWindowClicks: this.telemetry.outOfWindowClicks,
        typingErrors: this.telemetry.typingErrors,
        currentMaxStreak: this.telemetry.maxStreak,
        playedDurationSec: Math.round((performance.now() - this.gameStartedAt) / 1000),
        abandoned: true,
      }).subscribe({
        next: () => void this.router.navigate(['/patient', this.patient!.id]),
        error: () => void this.router.navigate(['/patient', this.patient!.id]),
      });
      return;
    }

    this.stopLoop();
    void this.router.navigate(['/patient', this.patient.id]);
  }

  private startGame(): void {
    this.stopLoop();
    this.telemetry.reset();
    this.wordService.resetSessionWords();
    this.currentObstacle = 1;
    this.worldScrollX = 0;
    this.isSavingSession = false;
    if (this.patient) {
      this.config = this.gameConfigService.getConfigForPatient(this.patient.id)
        ?? this.gameConfigService.currentConfigSnapshot
        ?? this.clinicalDefaultsService.getDefaultConfig(this.patient);
      this.selectedTheme = this.config.theme;
    }
    this.totalObstacles = Math.max(3, Math.round(this.config.durationSeconds / 10));
    this.phase = 'COUNTDOWN'; this.phaseStartedAt = performance.now(); this.countdownValue = 3;
    this.gameStartedAt = this.phaseStartedAt;
    setTimeout(() => { this.context = this.canvasRef?.nativeElement.getContext('2d') ?? undefined; this.frame = requestAnimationFrame(t => this.render(t)); });
  }

  private render(time: number): void {
    this.lastFrameTime = time;
    this.update(time);
    this.draw(time);
    if (this.phase !== 'FINISHED' && this.phase !== 'SELECT_THEME' && !document.hidden) {
      this.frame = requestAnimationFrame((nextTime) => this.render(nextTime));
    }
  }
  private update(time: number): void {
    const elapsed = (time - this.phaseStartedAt) / 1000;
    const scrollStep = this.phase === 'FOCUS' ? 0.35 : 2;
    this.worldScrollX = (this.worldScrollX + scrollStep) % 960;
    if (this.phase === 'COUNTDOWN') {
      this.countdownValue = Math.max(0, 3 - Math.floor(elapsed));
      if (elapsed >= 3.8) this.spawnObstacle(time);
    } else if (this.phase === 'APPROACHING') {
      this.focusProgress = 0;
      const progress = Math.min(elapsed / 2.2, 1); this.obstacleX = 980 - (980 - this.focusStartX) * progress;
      if (progress >= 1) { this.phase = 'FOCUS'; this.phaseStartedAt = time; this.focusEnteredAt = time; }
    } else if (this.phase === 'FOCUS') {
      this.focusProgress = Math.min(elapsed / this.focusDurationSeconds, 1); this.obstacleX = this.focusStartX - (this.focusStartX - this.focusEndX) * this.focusProgress;
      if (this.focusProgress >= 1) this.miss(time);
    } else if (this.phase === 'RESOLVING_SUCCESS' && elapsed >= 0.9) this.next(time);
    else if (this.phase === 'PASSING_MISSED' && elapsed >= 1.3) this.next(time);
  }

  private spawnObstacle(time: number): void {
    this.phase = 'APPROACHING'; this.phaseStartedAt = time; this.obstacleX = 980; this.obstacleY = 310;
    this.obstacleType = this.currentObstacle % 2 === 1 ? 'A' : 'B';
    this.letterTiles = this.wordService.prepareWord(
      this.selectedTheme,
      this.config.difficulty,
      this.config.mode,
      this.patient?.customWords,
    );
    this.targetWord = this.wordService.targetWord;
    this.hasEarlyPressWarning = false;
    this.hasSoftErrorTile = false;
  }
  private success(time: number): void { if (this.phase !== 'FOCUS') return; this.telemetry.recordSuccess(time - this.focusEnteredAt); this.resolutionStartX = this.obstacleX; this.phase = 'RESOLVING_SUCCESS'; this.phaseStartedAt = time; }
  private miss(time: number): void { this.telemetry.recordMiss(); this.letterTiles = this.wordService.revealAllLetters(); this.resolutionStartX = this.obstacleX; this.phase = 'PASSING_MISSED'; this.phaseStartedAt = time; }
  private next(time: number): void {
    if (this.currentObstacle >= this.totalObstacles) {
      this.finishGame();
      return;
    }
    this.currentObstacle += 1;
    this.spawnObstacle(time);
  }

  private finishGame(): void {
    if (!this.patient || this.isSavingSession) {
      return;
    }

    this.isSavingSession = true;
    this.phase = 'FINISHED';
    this.stopLoop();
    const sessionId = this.route.snapshot.queryParamMap.get('sessionId') ?? undefined;
    this.sessionService.saveSession(this.patient.id, {
      sessionId,
      config: this.config,
      responseTimesMs: this.responseTimesMs,
      obstaclesCleared: this.telemetry.obstaclesCleared,
      obstaclesMissed: this.telemetry.obstaclesMissed,
      outOfWindowClicks: this.telemetry.outOfWindowClicks,
      typingErrors: this.telemetry.typingErrors,
      currentMaxStreak: this.telemetry.maxStreak,
      playedDurationSec: Math.round((performance.now() - this.gameStartedAt) / 1000),
      abandoned: false,
    }).subscribe({
      next: (result) => {
        void this.router.navigate(['/game-end', result.sessionId]);
      },
      error: () => {
        this.isSavingSession = false;
      },
    });
  }
  private draw(time: number): void {
    const canvas = this.canvasRef?.nativeElement; if (!canvas || !this.context || !this.renderer) return;
    const elapsed = (time - this.phaseStartedAt) / 1000;
    const progress = this.phase === 'RESOLVING_SUCCESS' ? Math.min(elapsed / 0.9, 1) : Math.min(elapsed / 1.3, 1);
    this.renderer.drawScene(this.context, canvas, this.images, {
      phase: this.phase as RenderPhase,
      obstacleType: this.obstacleType,
      obstacleX: this.obstacleX,
      obstacleY: this.obstacleY,
      avatarX: 180,
      avatarY: 310,
      resolutionStartX: this.resolutionStartX,
      worldScrollX: this.worldScrollX,
      time,
      progress,
      focusProgress: this.focusProgress,
      focusStartX: this.focusStartX,
      focusEndX: this.focusEndX,
    });
  }
  private stopLoop(): void { if (this.frame !== undefined) cancelAnimationFrame(this.frame); this.frame = undefined; }
  private async preloadTheme(theme: ThemeConfig): Promise<Record<string, HTMLImageElement>> {
    const paths = [
      theme.groundTile,
      theme.avatarSprite,
      theme.obstacleASprite,
      theme.obstacleBSprite,
      theme.obstacleBSlideSprite,
      theme.obstacleBCarriedSprite,
      theme.targetSprite,
      theme.projectileSprite,
      theme.effectSprite,
    ].filter((path): path is string => Boolean(path));
    const entries = await Promise.all(paths.map(async path => [path, await this.loadImage(path)] as const)); return Object.fromEntries(entries);
  }
  private loadImage(src: string): Promise<HTMLImageElement> { return new Promise(resolve => { const image = new Image(); image.onload = () => resolve(image); image.onerror = () => resolve(image); image.src = src; }); }
}
