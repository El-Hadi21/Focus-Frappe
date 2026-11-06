import { test, expect } from '@playwright/test';
import { AuthFixture } from '../fixtures/auth.fixture';
import { DashboardFixture } from '../fixtures/dashboard.fixture';
import { SessionConfigFixture } from '../fixtures/session-config.fixture';
import { GameEngineFixture } from '../fixtures/game-engine.fixture';

test.describe('Suite 4 — Moteur de Gameplay, Zone de Focus et Garde-fous TDA/H', () => {
  test.beforeEach(async ({ page }) => {
    const auth = new AuthFixture(page);
    const dashboard = new DashboardFixture(page);
    const config = new SessionConfigFixture(page);

    await auth.login();
    await dashboard.openPatientHub('Emma Moreau');
    await page.getByRole('button', { name: 'Configurer la séance' }).click();

    // Configuration rapide : Facile, 30 secondes (3 obstacles)
    await config.selectDifficulty('Facile');
    await config.selectDuration(30);
    await config.startGame();
    await expect(page).toHaveURL(/\/game\//);
  });

  test('E2E-4.1 & 4.2 : Sélection d’univers, compte à rebours et absence de télémétrie anxiogène', async ({
    page,
  }) => {
    const game = new GameEngineFixture(page);

    // Survol du thème Espace -> fond dynamique .theme-space
    await page.locator('button.theme-choice', { hasText: 'Espace' }).hover();
    await expect(page.locator('main.theme-selection-page')).toHaveClass(/theme-space/);

    // Lancement du thème Football
    await game.selectThemeToStart('Football');
    await expect(page.locator('main.game-page')).toHaveClass(/theme-foot/);
    await expect(page.locator('.countdown-overlay')).toBeVisible();

    // Vérifie que le footer ne contient aucun compteur d'erreurs ou de clics hors-fenêtre
    const footerText = await page.locator('.game-footer').innerText();
    expect(footerText).not.toMatch(/erreur|hors-fenêtre/i);

    // Test du bouton Muet dans le HUD
    await game.muteButton.click();
    await expect(game.muteButton).toHaveAttribute('aria-label', 'Activer le son');
    await game.muteButton.click();
  });

  test('E2E-4.3 & 4.4 : Rappel doux en approche, erreur douce en Focus, validation d’obstacle et abandon', async ({
    page,
  }) => {
    const game = new GameEngineFixture(page);

    await game.selectThemeToStart('Football');

    // Attente de la fin du compte à rebours (entrée en APPROACHING)
    await expect(page.locator('.phase-status')).toContainText('Obstacle en approche', {
      timeout: 8_000,
    });

    // 1. Frappe précoce hors-fenêtre -> toast bienveillant
    await page.keyboard.press('a');
    await expect(game.earlyPressToast).toBeVisible();

    // 2. Entrée en Zone de Focus : test d'une mauvaise lettre (erreur douce ambrée)
    const firstTile = page.locator('.letter-tile.is-current').first();
    await expect(firstTile).toBeVisible({ timeout: 10_000 });
    const expectedChar = (await firstTile.innerText()).trim().toLowerCase();
    const wrongChar = expectedChar === 'z' ? 'y' : 'z';

    await page.keyboard.press(wrongChar);
    await expect(firstTile).toHaveClass(/is-soft-error/);

    // 3. Frappe complète du mot attendu -> incrémentation de "Franchis" et "Série"
    await game.waitForFocusAndTypeCurrentWord();
    await expect(game.clearedCounter).toHaveText('1');
    await expect(game.streakCounter).toHaveText('1');

    // 4. Abandon de la partie en cours via le bouton Quitter
    await expect(page.locator('.phase-status')).toContainText('Obstacle en approche', {
      timeout: 8_000,
    });
    await game.quitButton.click();
    await expect(page).toHaveURL(/\/patient\//);
  });
});