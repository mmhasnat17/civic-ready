import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // './' keeps built assets working under any GitHub Pages repository name.
  base: './',
  server: { proxy: { '/api': 'http://127.0.0.1:3001' } },
});
