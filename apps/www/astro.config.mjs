import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  server: {
    host: true,
  },
  integrations: [react()],
  output: 'hybrid',
  adapter: node({
    mode: 'standalone',
  }),
  vite: {
    ssr: {
      noExternal: ['path-to-regexp'],
    },
  },
});
