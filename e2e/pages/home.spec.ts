import { test, expect } from '@playwright/test';
import { HomePage } from '../models/HomePage';

test.describe('Home page', () => {
  test('should have correct title', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await expect(page).toHaveTitle(/AI Flashcards/);
  });

  test('should contain main heading', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.expectTitleContains('AI Flashcards');
  });
}); 