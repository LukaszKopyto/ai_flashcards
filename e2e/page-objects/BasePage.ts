import { type Page, expect } from '@playwright/test';

export abstract class BasePage {
  protected constructor(protected readonly page: Page) {}

  abstract isPageLoaded(): Promise<boolean>;

  protected async waitForUrl(url: string): Promise<void> {
    await expect(this.page).toHaveURL(url);
  }
}
