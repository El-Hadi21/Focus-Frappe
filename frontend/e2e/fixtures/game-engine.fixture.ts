import { expect } from '@playwright/test';
import { E2EComponentFixture } from '../e2e-component.fixture';

export class GameEngineFixture extends E2EComponentFixture {
  get canvas() {
    return this.page.locator('canvas');
  }

  get wordPromptBox() {
    return this.page.locator('.word-prompt-box');
  }

  get letterTiles() {
    return this.page.locator('.letter-tile');
  }

  get clearedCounter() {
    return this.page.locator('.hud-pill-cleared strong');
  }

  get streakCounter() {
    return this.page.locator('.hud-pill-streak strong');
  }

  get earlyPressToast() {
    return this.page.locator('.early-press-toast');
  }

  get muteButton() {
    return this.page.locator('button.mute-button');
  }

  get quitButton() {
    return this.page.locator('button.quit-button');
  }

  async selectThemeToStart(theme: 'Football' | 'Espace'): Promise<void> {
      const themeButton = this.page.getByRole('button', { name: new RegExp(`Univers ${theme}`, 'i') });
      await expect(themeButton).toBeVisible();
      await themeButton.click();
      await expect(this.canvas).toBeVisible({ timeout: 10_000 });
    }

  /**
   * Attend que l'obstacle entre dans la Zone de Focus (.word-prompt-box visible avec une tuile .is-current),
   * lit les lettres affichées dans les tuiles et les tape au clavier.
   */
  async waitForFocusAndTypeCurrentWord(): Promise<void> {
    await expect(this.page.locator('.letter-tile.is-current').first()).toBeVisible({
      timeout: 15_000,
    });

    const count = await this.letterTiles.count();
    let word = '';
    for (let i = 0; i < count; i++) {
      const char = (await this.letterTiles.nth(i).innerText()).trim().toLowerCase();
      word += char;
    }

    for (const char of word) {
      await this.page.keyboard.press(char);
    }
  }
}