import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts', 'test/**/*.test.ts'],
    clearMocks: true,
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      exclude: ['src/entrypoints/**'],
      thresholds: { lines: 80, branches: 80 },
    },
  },
});
