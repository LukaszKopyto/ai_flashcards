import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly loginButtonText: Locator;
  readonly buttonSpinner: Locator;
  
  readonly emailError: Locator;
  readonly passwordError: Locator;
  
  readonly forgotPasswordLink: Locator;
  readonly registerLink: Locator;

  private readonly LOGIN_URL = '/login';
  private readonly GENERATE_URL = '/generate';

  constructor(page: Page) {
    super(page);
    
    this.emailInput = page.locator('input[data-testid="email-input"]');
    this.passwordInput = page.locator('input[data-testid="password-input"]');
    this.loginButton = page.getByTestId('login-button');
    this.loginButtonText = page.getByTestId('login-button-text');
    this.buttonSpinner = page.getByTestId('button-spinner');
    
    this.emailError = page.getByTestId('email-input-error');
    this.passwordError = page.getByTestId('password-input-error');
    
    this.forgotPasswordLink = page.getByTestId('forgot-password-link');
    this.registerLink = page.getByTestId('register-link');
  }

  async goto() {
    await this.page.goto(this.LOGIN_URL);
  }

  async isPageLoaded(): Promise<boolean> {
    return await Promise.all([
        this.emailInput.isVisible(),
        this.passwordInput.isVisible(),
        this.loginButton.isVisible()
    ]).then(results => results.every(Boolean));
  }

  async verifyInitialState(): Promise<void> {
    await expect(this.emailInput).toBeEmpty();
    await expect(this.passwordInput).toBeEmpty();
    await expect(this.loginButton).toBeEnabled();
    await expect(this.buttonSpinner).toBeHidden();
  }

  async login(email: string, password: string) {
    await this.emailInput.clear();
    await this.passwordInput.clear();

    await this.emailInput.fill(email);
    await expect(this.emailInput).toHaveValue(email);
    
    await this.passwordInput.fill(password);
    await expect(this.passwordInput).toHaveValue(password);
  
    await this.loginButton.click();
  }

  async waitForLoginSuccess() {
    await expect(this.page).toHaveURL(this.GENERATE_URL, { timeout: 10000 });
  }

  async waitForLoginPage() {
    await this.waitForUrl(this.LOGIN_URL);
  }

  async getEmailError(): Promise<string | null> {
    if (await this.emailError.isVisible()) {
      return await this.emailError.textContent();
    }
    return null;
  }

  async getPasswordError(): Promise<string | null> {
    if (await this.passwordError.isVisible()) {
      return await this.passwordError.textContent();
    }
    return null;
  }

  async isLoginButtonDisabled(): Promise<boolean> {
    return await this.loginButton.isDisabled();
  }

  async isLoading(): Promise<boolean> {
    return await this.buttonSpinner.isVisible();
  }
} 