import { expect } from '@playwright/test';
import { E2EComponentFixture } from '../e2e-component.fixture';
import { testUrl } from '../e2e.config';

export class AuthFixture extends E2EComponentFixture {
  get emailInput() {
    return this.page.locator('#email');
  }

  get passwordInput() {
    return this.page.locator('#password');
  }

  get submitButton() {
    return this.page.locator('button.login-submit');
  }

  get registerButton() {
    return this.page.locator('button.register-button');
  }

  get loginError() {
    return this.page.locator('.login-error[role="alert"]');
  }

  get logoutButton() {
    return this.page.locator('button.logout-button');
  }

  async gotoLogin(): Promise<void> {
    await this.page.goto(`${testUrl}/login`);
  }

  async login(email = 'ergo@focus-frappe.fr', password = 'ergo123'): Promise<void> {
    await this.gotoLogin();
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
    await expect(this.page).toHaveURL(/\/dashboard$/);
  }

  async registerPractitioner(data: {
    firstName: string;
    lastName: string;
    email: string;
    age: string;
    password: string;
    confirmPassword?: string;
  }): Promise<void> {
    await this.page.locator('#firstName').fill(data.firstName);
    await this.page.locator('#lastName').fill(data.lastName);
    await this.emailInput.fill(data.email);
    await this.page.locator('#age').fill(data.age);
    await this.passwordInput.fill(data.password);
    await this.page.locator('#confirmPassword').fill(data.confirmPassword ?? data.password);
  }

  async logout(): Promise<void> {
    await this.logoutButton.click();
    await expect(this.page).toHaveURL(/\/login$/);
  }
}