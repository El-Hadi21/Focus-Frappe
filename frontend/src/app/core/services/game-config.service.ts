import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { GameConfig } from '../models/game-config.model';

@Injectable({
  providedIn: 'root',
})
export class GameConfigService {
  private readonly currentConfigSubject = new BehaviorSubject<GameConfig | null>(null);
  readonly currentConfig$ = this.currentConfigSubject.asObservable();

  get currentConfigSnapshot(): GameConfig | null {
    return this.currentConfigSubject.value;
  }

  setCurrentConfig(config: GameConfig): void {
    this.currentConfigSubject.next(config);
  }
}
