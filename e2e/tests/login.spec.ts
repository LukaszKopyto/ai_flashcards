import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/LoginPage';

const hasAuthCredentials = Boolean(process.env.E2E_USERNAME && process.env.E2E_PASSWORD);

test.describe('Login Page', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test.afterEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('verifies initial page state', async () => {
    await loginPage.isPageLoaded();
    await loginPage.verifyInitialState();
  });

  test('successful login flow', async ({ page }) => {
    test.skip(!hasAuthCredentials, 'Skipping test: E2E_USERNAME and E2E_PASSWORD environment variables are required');
    
    const testEmail = process.env.E2E_USERNAME!;
    const testPassword = process.env.E2E_PASSWORD!;

    await loginPage.waitForLoginPage();
    await loginPage.isPageLoaded();
    
    await loginPage.login(testEmail, testPassword);
    
    await page.waitForTimeout(100);
    
    expect(await loginPage.getEmailError()).toBeNull();
    expect(await loginPage.getPasswordError()).toBeNull();

    await loginPage.waitForLoginSuccess();
  });

  test('send login request with email and password', async ({ page }) => {
    test.skip(!hasAuthCredentials, 'Skipping test: E2E_USERNAME and E2E_PASSWORD environment variables are required');
    
    const testEmail = process.env.E2E_USERNAME!;
    const testPassword = process.env.E2E_PASSWORD!;


    const loginRequestPromise = page.waitForRequest(request =>  
      request.url().includes('/api/auth/login') && 
      request.method() === 'POST'
    );

    const loginResponsePromise = page.waitForResponse(response =>
      response.url().includes('/api/auth/login') && 
      response.request().method() === 'POST'
    );

    await loginPage.login(testEmail, testPassword);

    const request = await loginRequestPromise;
    expect(request.postDataJSON()).toHaveProperty('email', testEmail);
    expect(request.postDataJSON()).toHaveProperty('password', testPassword);

    const response = await loginResponsePromise;
    expect(response.status()).toBe(200);
  });

  test('login with invalid credentials', async ({ page }) => {
    await loginPage.waitForLoginPage();
    await loginPage.isPageLoaded();

    await loginPage.login('invalid@example.com', 'invalidpassword');
    await page.waitForTimeout(100);

    await expect(loginPage.getEmailError()).not.toBeNull();
    await expect(loginPage.getPasswordError()).not.toBeNull();
  });

  test('displays loading state during login', async ({ page }) => {
    test.skip(!hasAuthCredentials, 'Skipping test: E2E_USERNAME and E2E_PASSWORD environment variables are required');
    
    const testEmail = process.env.E2E_USERNAME!;
    const testPassword = process.env.E2E_PASSWORD!;
    
    await page.route('**/api/auth/login', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });

    const loginPromise = loginPage.login(testEmail, testPassword);

    await expect(
      async () => {
        const isDisabled = await loginPage.isLoginButtonDisabled();
        const isLoading = await loginPage.isLoading();
        return isDisabled && isLoading;
      },
      'Button should be disabled and loading state should be visible'
    ).toPass({ timeout: 5000 });

    await loginPromise;
  });

  test('displays validation errors for empty fields', async ({ page }) => {
    await loginPage.login('', '');

    await expect(
      async () => {
        const emailError = await loginPage.getEmailError();
        const passwordError = await loginPage.getPasswordError();
        return emailError !== null && passwordError !== null;
      },
      'Both email and password error messages should be visible'
    ).toPass({ timeout: 5000 });
  });

  test('navigates to forgot password page', async ({ page }) => {
    await loginPage.forgotPasswordLink.click();
    await expect(page).toHaveURL('/forgot-password', { timeout: 5000 });
  });

  test('navigates to registration page', async ({ page }) => {
    await loginPage.registerLink.click();
    await expect(page).toHaveURL('/register', { timeout: 5000 });
  });
}); 