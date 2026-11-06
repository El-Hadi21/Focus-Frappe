import { test, expect } from '@playwright/test';
import { AuthFixture } from '../fixtures/auth.fixture';
import { DashboardFixture } from '../fixtures/dashboard.fixture';

test.describe('Suite 2 — Dashboard, Sidebar Praticien et Cycle de vie Patient', () => {
  test.beforeEach(async ({ page }) => {
    const auth = new AuthFixture(page);
    await auth.login();
  });

  test('E2E-2.1 : Affichage des patients initiaux et de la Sidebar Persona Ergothérapeute', async ({
    page,
  }) => {
    const dashboard = new DashboardFixture(page);

    await expect(dashboard.personaSidebar).toBeVisible();
    await expect(dashboard.personaSidebar).toContainText('Ergothérapeute');
    await expect(dashboard.personaSidebar).toContainText('Martin');
    await expect(dashboard.personaSidebar).toContainText('Claire');

    // Léo Dubois a une séance initiale dans e2e-starter
    await expect(dashboard.patientCardByName('Léo Dubois')).toBeVisible();
    await expect(dashboard.patientCardByName('Emma Moreau')).toBeVisible();
    await expect(dashboard.lastPlayedPatientValue).toContainText('Léo Dubois');
  });

  test('E2E-2.2 & 2.3 : Création d’un nouveau profil enfant avec avatar puis suppression via modale', async ({
    page,
  }) => {
    const dashboard = new DashboardFixture(page);
    const uniqueFirstName = `Lucas${Date.now().toString().slice(-4)}`;

    // 1. Création du profil
    await dashboard.createPatient({
      firstName: uniqueFirstName,
      lastName: 'Petit',
      age: '9',
      severityLabel: 'Modérée',
      attentionLabel: 'Hyperactif',
      avatarIndex: 4, // Espace 1
    });

    const createdCard = dashboard.patientCardByName(`${uniqueFirstName} Petit`);
    await expect(createdCard).toBeVisible();
    await expect(createdCard.locator('img')).toHaveAttribute('src', /space-av1\.png$/);

    // 2. Ouverture du Hub patient et test d'annulation de suppression
    await dashboard.openPatientHub(`${uniqueFirstName} Petit`);
    await page.getByRole('button', { name: 'Supprimer le profil' }).click();
    await expect(dashboard.deleteModal).toBeVisible();

    await page.getByRole('button', { name: 'Annuler' }).click();
    await expect(dashboard.deleteModal).toBeHidden();

    // 3. Confirmation de la suppression
    await page.getByRole('button', { name: 'Supprimer le profil' }).click();
    await dashboard.deleteModal.getByRole('button', { name: 'Confirmer' }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(createdCard).toHaveCount(0);
  });
});