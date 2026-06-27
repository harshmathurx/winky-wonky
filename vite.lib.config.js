import { defineConfig } from 'vite';
import { copyFileSync } from 'fs';
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
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'winky-wonky.css';
          return assetInfo.name;
        },
      },
    },
  },
  plugins: [
    {
      name: 'copy-css',
      closeBundle() {
        copyFileSync(
          resolve(__dirname, 'src/style.css'),
          resolve(__dirname, 'dist/winky-wonky.css')
        );
      },
    },
  ],
});
