import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      // Only proxy actual backend calls, allow the "/api" route for the React app
      '/api/': {
        target: process.env.VITE_API_URL || 'http://localhost:5266',
        changeOrigin: true,
      },
    },
  },
});
