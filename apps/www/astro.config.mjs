import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  server: {
    // Listens on any origin host (0.0.0.0), necessary for dev env and deployment
    host: true,
  },
  // Adds React support
  integrations: [react()],
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  vite: {
    server: {
      allowedHosts: ['8080--main--dnd-assistant--cmeyer.coder.tartarus.cloud'],
    },
    ssr: {
      // This marks the `path-to-regexp` package as external, so it won't be bundled in the server build
      // Necessary for how we render Ionic within Astro
      noExternal: ['path-to-regexp'],
    },
  },
});
