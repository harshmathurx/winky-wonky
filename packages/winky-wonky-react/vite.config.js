import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    lib: {
      entry: 'src/index.jsx',
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      // Keep this package a thin wrapper: React and winky-wonky stay
      // peerDependencies, never bundled into dist/index.js.
      external: ['react', 'react-dom', 'react/jsx-runtime', 'winky-wonky'],
    },
    sourcemap: true,
  },
});
