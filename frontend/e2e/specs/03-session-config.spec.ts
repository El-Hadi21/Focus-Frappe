import { test, expect } from '@playwright/test';
import { AuthFixture } from '../fixtures/auth.fixture';
import { DashboardFixture } from '../fixtures/dashboard.fixture';
import { SessionConfigFixture } from '../fixtures/session-config.fixture';

test.describe('Suite 3 — Configuration de Séance, Dictionnaire Personnalisé et Confort Sensoriel', () => {
  test.beforeEach(async ({ page }) => {
    const auth = new AuthFixture(page);
    const dashboard = new DashboardFixture(page);

    await auth.login();
    await dashboard.openPatientHub('Léo Dubois');
    await page.getByRole('button', { name: 'Configurer la séance' }).click();
    await expect(page).toHaveURL(/\/configuration\//);
  });

  test('E2E-3.1 & 3.2 : Pré-sélection clinique par défaut (Facile / 60 s) et mise à jour de l’avatar', async ({
    page,
  }) => {
    // Léo a une dysgraphie "severe" (-> Facile) et un profil "inattentif" (-> 60 s)
    const facileRadio = page.locator('.choice-option', { hasText: 'Facile' }).locator('input[type="radio"]');
    const duration60Radio = page.locator('.duration-option', { hasText: '60 s' }).locator('input[type="radio"]');

    await expect(facileRadio).toBeChecked();
    await expect(duration60Radio).toBeChecked();

    // Changement d'avatar en direct
    await page.locator('.config-avatar-option').nth(2).click();
    await expect(page.locator('.avatar-saved-feedback')).toContainText(
      'Photo de profil mise à jour !',
    );
  });

  test('E2E-3.3 : Ajout, validation, auto-classement et suppression (×) de mots personnalisés', async ({
    page,
  }) => {
    const config = new SessionConfigFixture(page);

    // 1. Rejet d'un mot contenant des chiffres ou espaces
    await config.addCustomWord('but 123');
    await expect(config.customWordError).toContainText(
      'Le mot ne doit contenir que des lettres',
    );

    // 2. Ajout d'un mot valide et vérification du niveau calculé
    await config.addCustomWord('champion');
    const chip = page.locator('.word-chip', { hasText: 'champion' });
    await expect(chip).toBeVisible();
    await expect(chip.locator('.word-chip-level')).toHaveText('Normal');

    // 3. Suppression du mot via le bouton ×
    await config.removeCustomWord('champion');
    await expect(chip).toHaveCount(0);
  });

  test('E2E-3.4 : Activation du mode Mot à trous, de l’option Effets réduits et du contrôle Audio', async ({
    page,
  }) => {
    const config = new SessionConfigFixture(page);

    await config.toggleHoleMode();
    await expect(
      page.locator('.mode-section', { hasText: 'Mode de frappe' }).locator('.toggle-text small'),
    ).toHaveText('Activé');

    await config.toggleReducedEffects();
    await expect(
      page.locator('.mode-section', { hasText: 'Confort sensoriel' }).locator('.toggle-text small'),
    ).toHaveText('Activé');

    // Test du bouton Muet dans la section 07 Retour sonore
    const audioMuteBtn = page.locator('.audio-controls button');
    await audioMuteBtn.click();
    await expect(page.locator('.volume-value')).toHaveText('Muet');

    // On réactive le son pour la suite
    await audioMuteBtn.click();
    await expect(page.locator('.volume-value')).toContainText('%');
  });
});