import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  server: {
    // Listens on any origin host (0.0.0.0), necessary for dev env and deployment
    host: true,
  },
  site: 'https://feynote.com',
  integrations: [react(), sitemap()],
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  vite: {
    server: {
      // Currently hardcoded since allowedHosts: true is broken (GH issue here: https://github.com/withastro/astro/issues/13060)
      allowedHosts: ['.tartarus.cloud', '.feynote.com'],
    },
    ssr: {
      // This marks the `path-to-regexp` package as external, so it won't be bundled in the server build
      // Necessary for how we render Ionic within Astro
      noExternal: ['path-to-regexp', 'zod'],
    },
  },
});
