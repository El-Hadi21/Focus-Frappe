import { Injectable } from '@angular/core';
import { GameSoundEvent, ThemeSoundConfig } from '../../../core/models/theme-config.model';

const STORAGE_VOLUME_KEY = 'ff_audio_volume';
const STORAGE_MUTED_KEY = 'ff_audio_muted';

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  private readonly audioCache = new Map<string, HTMLAudioElement>();
  private currentThemeSounds?: ThemeSoundConfig;
  private audioCtx?: AudioContext;

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
  }

  setMuted(muted: boolean): void {
    this._isMuted = muted;
    localStorage.setItem(STORAGE_MUTED_KEY, String(this._isMuted));
  }

  toggleMute(): boolean {
    this.setMuted(!this._isMuted);
    return this._isMuted;
  }

  preloadThemeSounds(sounds: ThemeSoundConfig): void {
    this.currentThemeSounds = sounds;
    for (const path of Object.values(sounds)) {
      if (!this.audioCache.has(path)) {
        const audio = new Audio(path);
        audio.preload = 'auto';
        this.audioCache.set(path, audio);
      }
    }
  }

  play(event: GameSoundEvent): void {
    if (this._isMuted || this._volume <= 0) {
      return;
    }

    const src = this.currentThemeSounds?.[event];
    if (src) {
      const cached = this.audioCache.get(src);
      const instance = cached ? (cached.cloneNode(true) as HTMLAudioElement) : new Audio(src);

      // Pondération douce selon la nature clinique de l'événement
      const eventGain =
        event === 'typingError'
          ? 0.35
          : event === 'obstacleMissed'
            ? 0.45
            : event === 'correctLetter'
              ? 0.75
              : 0.9;

      instance.volume = Math.min(1, this._volume * eventGain);
      void instance.play().catch(() => undefined);
    }

    // Jingle mélodique doux (Web Audio) pour récompenser clairement l'obstacle franchi
    if (event === 'obstacleCleared') {
      this.playSuccessChime();
    } else if (event === 'obstacleMissed') {
      this.playNeutralMissTone();
    }
  }

  private playSuccessChime(): void {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) {
        return;
      }
      // Petit arpège majeur joyeux et apaisant (Do5 - Mi5 - Sol5)
      const notes = [523.25, 659.25, 783.99];
      const now = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.065);

        const peakGain = 0.16 * this._volume;
        gain.gain.setValueAtTime(0.001, now + idx * 0.065);
        gain.gain.exponentialRampToValueAtTime(peakGain, now + idx * 0.065 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.065 + 0.24);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.065);
        osc.stop(now + idx * 0.065 + 0.25);
      });
    } catch {
      // Ignore si le navigateur bloque l'AudioContext
    }
  }

  private playNeutralMissTone(): void {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) {
        return;
      }
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(330, now);
      osc.frequency.exponentialRampToValueAtTime(277.18, now + 0.18);

      const peakGain = 0.08 * this._volume;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(peakGain, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch {
      // Ignore
    }
  }

  private getAudioContext(): AudioContext | undefined {
    if (typeof window === 'undefined') {
      return undefined;
    }
    if (!this.audioCtx) {
      const AudioContextClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx?.state === 'suspended') {
      void this.audioCtx.resume();
    }
    return this.audioCtx;
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