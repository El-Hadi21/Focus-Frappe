import { E2EComponentFixture } from '../e2e-component.fixture';

export class SessionConfigFixture extends E2EComponentFixture {
  get customWordInput() {
    return this.page.locator('#custom-word');
  }

  get addWordButton() {
    return this.page.getByRole('button', { name: 'Ajouter', exact: true });
  }

  get wordChips() {
    return this.page.locator('.word-chip');
  }

  get customWordError() {
    return this.page.locator('.custom-word-feedback.error');
  }

  get volumeSlider() {
    return this.page.getByRole('slider', { name: 'Volume sonore' });
  }

  async selectDifficulty(level: 'Facile' | 'Normal' | 'Difficile'): Promise<void> {
    await this.page.locator('.choice-option', { hasText: level }).click();
  }

  async selectDuration(seconds: 30 | 60 | 90 | 120 | 150 | 180): Promise<void> {
    await this.page.locator('.duration-option', { hasText: `${seconds} s` }).click();
  }

  async selectTheme(theme: 'Football' | 'Espace'): Promise<void> {
    await this.page.locator('.theme-option', { hasText: theme }).click();
  }

  async addCustomWord(word: string): Promise<void> {
    await this.customWordInput.fill(word);
    await this.addWordButton.click();
  }

  async removeCustomWord(word: string): Promise<void> {
    await this.page.getByRole('button', { name: `Supprimer le mot ${word}` }).click();
  }

  async toggleHoleMode(): Promise<void> {
    await this.page.locator('.mode-section', { hasText: 'Mode de frappe' }).locator('.toggle-option').click();
  }

  async toggleReducedEffects(): Promise<void> {
    await this.page.locator('.mode-section', { hasText: 'Confort sensoriel' }).locator('.toggle-option').click();
  }

  async startGame(): Promise<void> {
    await this.page.getByRole('button', { name: /Lancer la partie/ }).click();
  }
}