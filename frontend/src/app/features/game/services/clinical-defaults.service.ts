import { Injectable } from '@angular/core';

import { GameConfig } from '../../../core/models/game-config.model';
import { Patient } from '../../../core/models/patient.model';

@Injectable({
  providedIn: 'root',
})
export class ClinicalDefaultsService {
  getDefaultConfig(patient: Patient): GameConfig {
    const dysgraphiaSeverity = this.normalize(patient.dysgraphiaSeverity);
    const attentionProfile = this.normalize(patient.attentionProfile);

    const difficulty: GameConfig['difficulty'] =
      dysgraphiaSeverity === 'severe'
        ? 'Facile'
        : dysgraphiaSeverity === 'moderee'
          ? 'Normal'
          : dysgraphiaSeverity === 'legere'
            ? 'Difficile'
            : 'Normal';

    const durationSeconds: GameConfig['durationSeconds'] =
      attentionProfile === 'inattentif'
        ? 60
        : attentionProfile === 'mixte'
          ? 90
          : attentionProfile === 'hyperactif'
            ? 120
            : 90;

    return {
      difficulty,
      durationSeconds,
      mode: 'Mot exact',
      theme: 'Football',
    };
  }

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }
}
