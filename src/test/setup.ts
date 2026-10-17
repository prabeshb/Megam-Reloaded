import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Mock @vercel/analytics/react so it doesn't interfere with JSDOM tests
vi.mock('@vercel/analytics/react', () => ({
  Analytics: () => null,
}));

beforeEach(() => {
  localStorage.clear();

  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Default navigator.onLine to true
  Object.defineProperty(window.navigator, 'onLine', {
    writable: true,
    value: true,
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
