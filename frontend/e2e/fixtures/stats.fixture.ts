import { E2EComponentFixture } from '../e2e-component.fixture';

export class StatsFixture extends E2EComponentFixture {
  // --- Game End ---
  get finishedCard() {
    return this.page.locator('.finished-card');
  }

  get earnedStars() {
    return this.page.locator('.star-icon.earned');
  }

  get confettiPieces() {
    return this.page.locator('.confetti-piece');
  }

  get backToProfileButton() {
    return this.page.locator('button.profile-link-btn');
  }

  // --- Patient Stats ---
  get statsCards() {
    return this.page.locator('.stats-card');
  }

  get svgChart() {
    return this.page.locator('svg.line-chart-svg');
  }

  get chartPoints() {
    return this.page.locator('circle.chart-point');
  }

  get notesTextarea() {
    return this.page.locator('#notes-input');
  }

  get saveNotesButton() {
    return this.page.getByRole('button', { name: 'Enregistrer les notes' });
  }

  get notesSavedFeedback() {
    return this.page.locator('.save-feedback', { hasText: 'Notes enregistrées avec succès.' });
  }
}