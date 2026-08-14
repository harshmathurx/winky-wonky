import { defineConfig } from 'vite';
import { copyFileSync, mkdirSync, readdirSync } from 'fs';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.js',
      name: 'WinkyWonky',
      fileName: (format) => {
        if (format === 'iife') return 'winky-wonky.min.js';
        return `winky-wonky.${format}.js`;
      },
      formats: ['es', 'iife'],
    },
  },
  plugins: [
    {
      // src/winky-wonky.css is a plain CSS aggregate (`@import`s tokens,
      // utilities, and one file per component from src/styles/). It isn't
      // referenced from any JS entry, so Rollup never sees it — copy it
      // (and the files it imports) into dist/ by hand, preserving the
      // same relative layout so the `@import './styles/...'` paths keep
      // resolving once published.
      name: 'copy-css',
      closeBundle() {
        const distStylesDir = resolve(__dirname, 'dist/styles');
        mkdirSync(distStylesDir, { recursive: true });
        copyFileSync(
          resolve(__dirname, 'src/winky-wonky.css'),
          resolve(__dirname, 'dist/winky-wonky.css')
        );
        for (const file of readdirSync(resolve(__dirname, 'src/styles'))) {
          copyFileSync(
            resolve(__dirname, 'src/styles', file),
            resolve(distStylesDir, file)
          );
        }
      },
    },
  ],
});
