import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Individual test files can opt into a different environment with a
    // `// @vitest-environment <name>` docblock at the top of the file
    // (used by tests/ssr-safe.test.js to run under plain Node).
    environment: 'jsdom',
    include: ['tests/**/*.test.js'],
  },
});
