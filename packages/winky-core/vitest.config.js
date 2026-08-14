import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Individual test files opt into jsdom with a
    // `// @vitest-environment jsdom` docblock where they need a DOM
    // (gesture tests); the default here is plain Node, matching this
    // package's "SSR-safe from day one" contract.
    environment: 'node',
    include: ['test/**/*.test.js'],
  },
});
