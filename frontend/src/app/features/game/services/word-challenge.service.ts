import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { GameConfig } from '../../../core/models/game-config.model';
import { THEME_CONFIGS } from '../../../core/models/theme-config.model';

export interface WordLetterTile {
  index: number;
  char: string;
  isHiddenSlot: boolean;
  isTyped: boolean;
  isCurrent: boolean;
  isRevealedAfterMiss: boolean;
}

@Injectable({ providedIn: 'root' })
export class WordChallengeService {
  private readonly dictionariesUrl = 'http://localhost:3000/api/dictionaries';
  private dictionaries: Record<string, Record<string, string[]>> | null = null;
  private word = '';
  private typedIndex = 0;
  private hiddenIndices = new Set<number>();
  private mode: GameConfig['mode'] = 'Mot exact';

  constructor(private readonly http: HttpClient) {}

  async loadDictionaries(): Promise<void> {
    if (!this.dictionaries) {
      this.dictionaries = await firstValueFrom(
        this.http.get<Record<string, Record<string, string[]>>>(this.dictionariesUrl),
      );
    }
  }

  prepareWord(
    theme: GameConfig['theme'],
    difficulty: GameConfig['difficulty'],
    mode: GameConfig['mode'],
  ): WordLetterTile[] {
    const words = this.dictionaries?.[theme]?.[difficulty]
      ?? THEME_CONFIGS[theme].dictionaries[difficulty];
    this.word = words[Math.floor(Math.random() * words.length)];
    this.typedIndex = 0;
    this.mode = mode;
    this.hiddenIndices = mode === 'Mot à trous' ? this.computeHiddenIndices(this.word) : new Set();
    return this.getTiles();
  }

  computeHiddenIndices(word: string): Set<number> {
    const hidden = new Set<number>();
    for (let index = 1; index < word.length - 1; index += 1) {
      if (index % 2 === 1 || word.length >= 9) {
        hidden.add(index);
      }
    }
    return hidden;
  }

  checkCharacter(char: string): 'correct' | 'incorrect' | 'complete' {
    if (char !== this.word[this.typedIndex]) {
      return 'incorrect';
    }
    this.typedIndex += 1;
    return this.typedIndex >= this.word.length ? 'complete' : 'correct';
  }

  revealAllLetters(): WordLetterTile[] {
    return this.getTiles().map((tile) => ({
      ...tile,
      isRevealedAfterMiss: true,
      isHiddenSlot: false,
    }));
  }

  get targetWord(): string {
    return this.word;
  }

  get typedCount(): number {
    return this.typedIndex;
  }

  getTiles(): WordLetterTile[] {
    return [...this.word].map((char, index) => ({
      index,
      char,
      isHiddenSlot: this.hiddenIndices.has(index) && this.typedIndex <= index,
      isTyped: index < this.typedIndex,
      isCurrent: index === this.typedIndex,
      isRevealedAfterMiss: false,
    }));
  }
}
