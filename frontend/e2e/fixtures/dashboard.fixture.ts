import { expect } from '@playwright/test';
import { E2EComponentFixture } from '../e2e-component.fixture';

export class DashboardFixture extends E2EComponentFixture {
  get addPatientButton() {
    return this.page.getByRole('button', { name: 'Ajouter un patient' });
  }

  get patientCards() {
    return this.page.locator('.patient-card');
  }

  get personaSidebar() {
    return this.page.locator('.persona-sidebar');
  }

  get lastPlayedPatientValue() {
    return this.page.locator('.persona-meta .meta-value.highlight');
  }

  get deleteModal() {
    return this.page.locator('.delete-modal[role="dialog"]');
  }

  patientCardByName(name: string) {
    return this.page.locator('.patient-card', { hasText: name });
  }

  async createPatient(data: {
    firstName: string;
    lastName: string;
    age: string;
    severityLabel?: 'Légère' | 'Modérée' | 'Sévère';
    attentionLabel?: 'Inattentif' | 'Mixte' | 'Hyperactif';
    avatarIndex?: number;
  }): Promise<void> {
    await this.addPatientButton.click();
    await expect(this.page).toHaveURL(/\/create-profile$/);

    if (data.avatarIndex !== undefined) {
      await this.page.locator('.avatar-choice').nth(data.avatarIndex).click();
    }

    await this.page.locator('#first-name').fill(data.firstName);
    await this.page.locator('#last-name').fill(data.lastName);
    await this.page.locator('#age').fill(data.age);

    if (data.severityLabel) {
      await this.page.locator('.select-box', { hasText: data.severityLabel }).click();
    }
    if (data.attentionLabel) {
      await this.page.locator('.select-box', { hasText: data.attentionLabel }).click();
    }

    await this.page.getByRole('button', { name: 'Enregistrer' }).click();
    await expect(this.page).toHaveURL(/\/dashboard$/);
  }

  async openPatientHub(name: string): Promise<void> {
    await this.patientCardByName(name).click();
    await expect(this.page).toHaveURL(/\/patient\//);
  }
}