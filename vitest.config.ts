import { defineConfig } from 'vitest/config';

// The @angular/build:unit-test builder (wired in angular.json's "test" target)
// already handles the Angular/Vite transform, TestBed environment setup, and
// test-file discovery internally. This file's only job is to carry settings
// the builder doesn't expose its own CLI flags for: per-directory coverage
// thresholds. Setting `test.include`/`exclude`/`setupFiles` here is
// unsupported by the builder and was deliberately left out.
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: ['src/**/*.spec.ts', 'src/main.ts', 'src/environments/**'],
      thresholds: {
        'src/app/features/customer-search/services/**': {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },
        'src/app/features/customer-search/components/**': {
          statements: 90,
          branches: 90,
          functions: 90,
          lines: 90,
        },
      },
    },
  },
});
