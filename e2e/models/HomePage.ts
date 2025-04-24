import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly pageTitle: Locator;
  
  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('h1');
  }

  async goto() {
    await this.page.goto('/');
  }

  async expectTitleContains(text: string) {
    await expect(this.pageTitle).toContainText(text);
  }
} 