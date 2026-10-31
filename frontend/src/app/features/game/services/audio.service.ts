import { Injectable } from '@angular/core';
import { GameSoundEvent, ThemeSoundConfig } from '../../../core/models/theme-config.model';

const STORAGE_VOLUME_KEY = 'ff_audio_volume';
const STORAGE_MUTED_KEY = 'ff_audio_muted';
const VICTORY_SOUND_PATH = '/assets/sounds/UI/victory-fanfare.mp3';

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  private readonly audioCache = new Map<string, HTMLAudioElement>();
  private currentThemeSounds?: ThemeSoundConfig;
  private bgmAudio?: HTMLAudioElement;
  private isBgmDucked = false;

  private _volume = this.loadStoredVolume();
  private _isMuted = this.loadStoredMute();

  get volume(): number {
    return this._volume;
  }

  get isMuted(): boolean {
    return this._isMuted;
  }

  setVolume(value: number): void {
    this._volume = Math.max(0, Math.min(1, value));
    localStorage.setItem(STORAGE_VOLUME_KEY, String(this._volume));
    if (this._volume > 0 && this._isMuted) {
      this.setMuted(false);
    }
    this.updateBgmVolume();
  }

  setMuted(muted: boolean): void {
    this._isMuted = muted;
    localStorage.setItem(STORAGE_MUTED_KEY, String(this._isMuted));
    this.updateBgmVolume();
  }

  toggleMute(): boolean {
    this.setMuted(!this._isMuted);
    return this._isMuted;
  }

  preloadThemeSounds(sounds: ThemeSoundConfig): void {
    this.currentThemeSounds = sounds;
    const allPaths = [
      sounds.bgm,
      sounds.correctLetter,
      sounds.typingError,
      sounds.obstacleACleared,
      sounds.obstacleBCleared,
      VICTORY_SOUND_PATH,
    ];

    for (const path of allPaths) {
      if (path && !this.audioCache.has(path)) {
        const audio = new Audio(path);
        audio.preload = 'auto';
        this.audioCache.set(path, audio);
      }
    }
  }

  startBgm(reducedEffects = false): void {
    this.stopBgm();
    if (reducedEffects || !this.currentThemeSounds?.bgm) {
      return;
    }

    const bgmPath = this.currentThemeSounds.bgm;
    const bgm = new Audio(bgmPath);
    bgm.loop = true;
    this.bgmAudio = bgm;
    this.isBgmDucked = false;
    this.updateBgmVolume();

    if (!this._isMuted && this._volume > 0) {
      void bgm.play().catch(() => undefined);
    }
  }

  setBgmFocusDucking(inFocus: boolean): void {
    if (this.isBgmDucked === inFocus) {
      return;
    }
    this.isBgmDucked = inFocus;
    this.updateBgmVolume();
  }

  pauseBgm(): void {
    this.bgmAudio?.pause();
  }

  resumeBgm(): void {
    if (this.bgmAudio && !this._isMuted && this._volume > 0) {
      void this.bgmAudio.play().catch(() => undefined);
    }
  }

  stopBgm(): void {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio.currentTime = 0;
      this.bgmAudio = undefined;
    }
    this.isBgmDucked = false;
  }

  play(event: GameSoundEvent): void {
    if (this._isMuted || this._volume <= 0) {
      return;
    }

    const src = this.currentThemeSounds?.[event];
    if (!src) {
      return;
    }

    const cached = this.audioCache.get(src);
    const instance = cached ? (cached.cloneNode(true) as HTMLAudioElement) : new Audio(src);

    const eventGain =
      event === 'typingError'
        ? 0.35
        : event === 'correctLetter'
          ? 0.7
          : 0.95;

    instance.volume = Math.min(1, this._volume * eventGain);
    void instance.play().catch(() => undefined);
  }

  playVictoryFanfare(): void {
    this.stopBgm();
    if (this._isMuted || this._volume <= 0) {
      return;
    }

    const cached = this.audioCache.get(VICTORY_SOUND_PATH);
    const instance = cached
      ? (cached.cloneNode(true) as HTMLAudioElement)
      : new Audio(VICTORY_SOUND_PATH);
    instance.volume = Math.min(1, this._volume * 0.85);
    void instance.play().catch(() => undefined);
  }

  private updateBgmVolume(): void {
    if (!this.bgmAudio) {
      return;
    }
    if (this._isMuted || this._volume <= 0) {
      this.bgmAudio.volume = 0;
      this.bgmAudio.pause();
      return;
    }

    // Volume doux (22% en approche, réduit à 9% pendant la Zone de Focus pour la concentration)
    const baseGain = this.isBgmDucked ? 0.09 : 0.22;
    this.bgmAudio.volume = Math.min(1, this._volume * baseGain);
    if (this.bgmAudio.paused) {
      void this.bgmAudio.play().catch(() => undefined);
    }
  }

  private loadStoredVolume(): number {
    const raw = localStorage.getItem(STORAGE_VOLUME_KEY);
    if (raw === null) {
      return 0.7;
    }
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? Math.max(0, Math.min(1, parsed)) : 0.7;
  }

  private loadStoredMute(): boolean {
    return localStorage.getItem(STORAGE_MUTED_KEY) === 'true';
  }
}