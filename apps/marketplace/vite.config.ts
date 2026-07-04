import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@alrehla/ui': new URL('../../packages/ui/src', import.meta.url).pathname,
      '@alrehla/api': new URL('../../packages/api/src', import.meta.url).pathname,
      '@alrehla/auth': new URL('../../packages/auth/src', import.meta.url).pathname,
      '@alrehla/types': new URL('../../packages/types/src', import.meta.url).pathname,
      '@alrehla/config': new URL('../../packages/config/src', import.meta.url).pathname,
      '@alrehla/utils': new URL('../../packages/utils/src', import.meta.url).pathname,
    },
  },
  server: { port: 3000 },
  preview: { port: 4000 },
});
