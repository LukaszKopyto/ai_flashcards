# Testing in AI Flashcards

This document describes how to run and create tests for the AI Flashcards application.

## Unit Tests (Vitest)

Unit tests are implemented using Vitest and focus on testing individual components and functions in isolation.

### Running Unit Tests

```bash
# Run all unit tests in watch mode
pnpm test

# Run unit tests with UI for interactive debugging
pnpm test:ui

# Run tests with coverage reports
pnpm test:coverage
```

### Writing Unit Tests

Unit tests are located in `src/**/__tests__/*.{test,spec}.{js,ts,jsx,tsx}`.

Example test pattern:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import MyComponent from '../MyComponent.vue';

describe('MyComponent', () => {
  it('renders correctly', () => {
    const wrapper = mount(MyComponent);
    expect(wrapper.html()).toContain('expected content');
  });

  it('handles click events', async () => {
    const mockFn = vi.fn();
    const wrapper = mount(MyComponent, {
      props: {
        onClick: mockFn,
      },
    });

    await wrapper.find('button').trigger('click');
    expect(mockFn).toHaveBeenCalled();
  });
});
```

## End-to-End Tests (Playwright)

E2E tests use Playwright to test the application as a whole, simulating real user interactions.

### Running E2E Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run E2E tests with UI
pnpm test:e2e:ui

# Generate tests using Playwright's codegen
pnpm test:e2e:codegen
```

### Writing E2E Tests

E2E tests follow the Page Object Model pattern. They are located in the `e2e/` directory.

1. Define page models in `e2e/models/`
2. Write tests in `e2e/pages/`

Example page model:

```typescript
// e2e/models/HomePage.ts
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
```

Example test:

```typescript
// e2e/pages/home.spec.ts
import { test, expect } from '@playwright/test';
import { HomePage } from '../models/HomePage';

test.describe('Home page', () => {
  test('should have correct title', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await expect(page).toHaveTitle(/AI Flashcards/);
  });
});
```
