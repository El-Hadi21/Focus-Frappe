import { test, expect } from '@playwright/test';
import { AuthFixture } from '../fixtures/auth.fixture';
import { DashboardFixture } from '../fixtures/dashboard.fixture';
import { SessionConfigFixture } from '../fixtures/session-config.fixture';
import { GameEngineFixture } from '../fixtures/game-engine.fixture';
import { StatsFixture } from '../fixtures/stats.fixture';

test.describe('Suite 5 — Fin de Partie (GameEnd), Statistiques Cliniques et Notes', () => {
  test('E2E-5.1, 5.2 & 5.3 : Partie complète (3 obstacles), écran 3 étoiles + confettis, stats SVG et notes', async ({
    page,
  }) => {
    const auth = new AuthFixture(page);
    const dashboard = new DashboardFixture(page);
    const config = new SessionConfigFixture(page);
    const game = new GameEngineFixture(page);
    const stats = new StatsFixture(page);

    await auth.login();
    await dashboard.openPatientHub('Emma Moreau');
    await page.getByRole('button', { name: 'Configurer la séance' }).click();

    // Configuration d'une manche courte de 30s (3 obstacles)
    await config.selectDifficulty('Facile');
    await config.selectDuration(30);
    await config.selectTheme('Espace');
    await config.startGame();

    await game.selectThemeToStart('Espace');

    // Franchissement des 3 obstacles de la manche de 30s
    for (let obstacle = 1; obstacle <= 3; obstacle++) {
      await game.waitForFocusAndTypeCurrentWord();
      await expect(game.clearedCounter).toHaveText(String(obstacle));
    }

    // 1. Vérification de la redirection automatique vers /game-end/:sessionId
    await expect(page).toHaveURL(/\/game-end\//, { timeout: 10_000 });
    await expect(stats.finishedCard).toContainText('Bravo Emma !');
    await expect(stats.finishedCard).toContainText('3 / 3 obstacles franchis');

    // Attente de l'apparition séquentielle des 3 étoiles et des confettis
    await expect(stats.earnedStars).toHaveCount(3, { timeout: 5_000 });
    await expect(stats.confettiPieces.first()).toBeVisible();

    // 2. Retour au profil patient puis ouverture des Statistiques
    await stats.backToProfileButton.click();
    await expect(page).toHaveURL(/\/patient\//);
    await page.getByRole('button', { name: 'Statistiques' }).click();
    await expect(page).toHaveURL(/\/stats\//);

    // Vérification des données de la séance et du graphique SVG
    await expect(stats.statsCards.first()).toContainText('3 franchis / 0 manqué');
    await expect(stats.svgChart).toBeVisible();
    await expect(stats.chartPoints.first()).toBeVisible();

    // Bascule entre les onglets du graphique de progression
    await page.getByRole('button', { name: 'Taux de franchissement' }).click();
    await expect(page.locator('.y-title')).toContainText('Taux de franchissement');

    // 3. Enregistrement d'une note clinique d'observation
    const clinicalNote = 'Excellente concentration sur le thème Espace.';
    await stats.notesTextarea.fill(clinicalNote);
    await stats.saveNotesButton.click();
    await expect(stats.notesSavedFeedback).toBeVisible();

    // 4. Retour au Dashboard et vérification du "Dernier patient joué" dans la sidebar
    await page.getByRole('button', { name: /Retour/ }).click();
    await page.getByRole('button', { name: 'Retour au tableau de bord' }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(dashboard.lastPlayedPatientValue).toContainText('Emma Moreau');
  });
});