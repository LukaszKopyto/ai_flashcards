import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/vue';

// Automatically cleanup after each test
afterEach(() => {
  cleanup();
});

// Global matchers can be added here if needed
