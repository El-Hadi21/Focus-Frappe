import { test, expect } from '@playwright/test';
import { AuthFixture } from '../fixtures/auth.fixture';
import { testUrl } from '../e2e.config';

test.describe('Suite 1 — Authentification et Compte Praticien', () => {
  test('E2E-1.1 & 1.2 : Redirection vers /login et rejet des identifiants invalides', async ({ page }) => {
    const auth = new AuthFixture(page);

    await page.goto(testUrl);
    await expect(page).toHaveURL(/\/login$/);

    await auth.emailInput.fill('ergo@example.com');
    await auth.passwordInput.fill('mauvais-mot-de-passe');
    await auth.submitButton.click();

    await expect(auth.loginError).toContainText(
      'Impossible de vous connecter avec ces identifiants.',
    );
    await expect(page).toHaveURL(/\/login$/);
  });

  test('E2E-1.3 : Inscription d’un nouveau praticien et vérification des mots de passe', async ({
    page,
  }) => {
    const auth = new AuthFixture(page);

    await auth.gotoLogin();
    await auth.registerButton.click();
    await expect(page).toHaveURL(/\/register$/);

    // 1. Test avec mots de passe différents
    await auth.registerPractitioner({
      firstName: 'Marc',
      lastName: 'Lefevre',
      email: `marc.${Date.now()}@example.com`,
      age: '29',
      password: 'password123',
      confirmPassword: 'different123',
    });
    await page.locator('#confirmPassword').blur();

    await expect(page.locator('.field-error[role="alert"]')).toContainText(
      'Les mots de passe ne correspondent pas.',
    );

    // 2. Correction et soumission valide
    await page.locator('#confirmPassword').fill('password123');
    await page.locator('.register-actions button[type="submit"]').click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('E2E-1.4 : Connexion réussie avec Claire Martin et déconnexion', async ({ page }) => {
    const auth = new AuthFixture(page);

    await auth.login('ergo@focus-frappe.fr', 'ergo123');

    const storedLoginTime = await page.evaluate(() =>
      localStorage.getItem('ff_last_connected_at'),
    );
    expect(storedLoginTime).toBeTruthy();

    await auth.logout();
  });
});