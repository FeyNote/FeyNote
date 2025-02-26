import { defineConfig } from 'astro/config';

import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
  server: {
    // Listens on any origin host (0.0.0.0), necessary for dev env and deployment
    host: true,
  },
  site: 'https://docs.feynote.com',
  integrations: [
    starlight({
      title: 'FeyNote Docs',
      logo: {
        src: './src/assets/feynote-icon-20240925.png',
      },
      social: {
        discord: 'https://discord.gg/Tz8trXrd4C',
      },
      sidebar: [
        'index',
        {
          label: 'Artifacts',
          items: [
            'artifacts/text',
            'artifacts/draw',
            'artifacts/calendar',
            'artifacts/references',
            'artifacts/graph',
            'artifacts/sharing',
          ],
        },
        {
          label: 'General',
          items: [
            'general/dashboard',
            'general/search',
            'general/offline',
            {
              label: 'Layout & UI',
              items: ['general/layout/desktop-panes', 'general/layout/mobile'],
            },
          ],
        },
        {
          label: 'Settings',
          items: ['settings/general', 'settings/import', 'settings/export'],
        },
      ],
    }),
  ],
  vite: {
    server: {
      allowedHosts: true,
    },
    ssr: {
      // This marks the `path-to-regexp` package as external, so it won't be bundled in the server build
      // Necessary for how we render Ionic within Astro
      noExternal: ['path-to-regexp'],
    },
  },
});
