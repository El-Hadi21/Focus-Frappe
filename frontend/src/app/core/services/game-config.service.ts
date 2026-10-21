import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { GameConfig } from '../models/game-config.model';

@Injectable({
  providedIn: 'root',
})
export class GameConfigService {
  private readonly currentConfigSubject = new BehaviorSubject<GameConfig | null>(null);
  private readonly configsByPatient = new Map<string, GameConfig>();
  readonly currentConfig$ = this.currentConfigSubject.asObservable();

  get currentConfigSnapshot(): GameConfig | null {
    return this.currentConfigSubject.value;
  }

  setCurrentConfig(config: GameConfig): void {
    this.currentConfigSubject.next(config);
  }

  setConfigForPatient(patientId: string, config: GameConfig): void {
    this.configsByPatient.set(patientId, config);
    this.setCurrentConfig(config);
  }

  getConfigForPatient(patientId: string): GameConfig | undefined {
    return this.configsByPatient.get(patientId);
  }
}
