import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    cors: true,
    hmr: {
      clientPort: 5173,
    },
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: false,
  },
});
