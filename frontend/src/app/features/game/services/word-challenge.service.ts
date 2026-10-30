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
  private lastWord = '';
  private usedWordsInGame = new Set<string>();
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

  resetSessionWords(): void {
    this.usedWordsInGame.clear();
  }

  prepareWord(
    theme: GameConfig['theme'],
    difficulty: GameConfig['difficulty'],
    mode: GameConfig['mode'],
    customWords: string[] = [],
  ): WordLetterTile[] {
    const dictionaryWords = (
      this.dictionaries?.[theme]?.[difficulty] ?? THEME_CONFIGS[theme].dictionaries[difficulty]
    ).map((w) => w.trim().toLowerCase());

    const minLength = difficulty === 'Facile' ? 1 : difficulty === 'Normal' ? 5 : 9;
    const maxLength = difficulty === 'Facile' ? 4 : difficulty === 'Normal' ? 8 : Infinity;
    const matchingCustomWords = customWords
      .map((w) => w.trim().toLowerCase())
      .filter((word) => word.length >= minLength && word.length <= maxLength);

    const words = [...new Set([...dictionaryWords, ...matchingCustomWords])];

    // On exclut tous les mots déjà joués dans la partie en cours
    let availableWords = words.filter((candidate) => !this.usedWordsInGame.has(candidate));

    // Si tous les mots du palier ont été vus, on réinitialise le sac en évitant quand même le dernier mot
    if (availableWords.length === 0) {
      this.usedWordsInGame.clear();
      availableWords = words.length > 1 ? words.filter((candidate) => candidate !== this.lastWord) : words;
    }

    this.word = availableWords[Math.floor(Math.random() * availableWords.length)] ?? '';
    this.lastWord = this.word;
    this.usedWordsInGame.add(this.word);
    this.typedIndex = 0;
    this.mode = mode;
    this.hiddenIndices = mode === 'Mot à trous' ? this.computeHiddenIndices(this.word, difficulty) : new Set();
    return this.getTiles();
  }

  computeHiddenIndices(word: string, difficulty: GameConfig['difficulty']): Set<number> {
    const hiddenCount = difficulty === 'Facile' ? 1 : difficulty === 'Normal' ? 2 : 3;
    const candidates = Array.from({ length: Math.max(0, word.length - 2) }, (_, index) => index + 1);
    const shuffled = candidates.sort(() => Math.random() - 0.5);
    return new Set(shuffled.slice(0, hiddenCount));
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