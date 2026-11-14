import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' keeps all asset paths relative, so the build works on
// GitHub Pages under /<repo-name>/ without extra configuration.
export default defineConfig({
  base: './',
  plugins: [react()],
  worker: { format: 'es' },
  build: { target: 'es2022', chunkSizeWarningLimit: 2500 },
  optimizeDeps: { esbuildOptions: { target: 'es2022' } },
});
