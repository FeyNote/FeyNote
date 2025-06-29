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
      head: [
        {
          tag: 'script',
          attrs: {
            defer: true,
            src: 'https://cloud.umami.is/script.js',
            'data-website-id': '921628de-7259-4592-ae46-667d8d1f8b46',
          },
        },
      ],
      logo: {
        src: './src/assets/feynote-icon-20240925.png',
      },
      social: [
        {
          icon: 'discord',
          label: 'Discord',
          href: 'https://discord.gg/Tz8trXrd4C',
        },
      ],
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
      allowedHosts: [
        '8081--main--dndassistant--julianpoyourow.coder.tartarus.cloud',
        '8081--main--feynotedocumentation--alexispoyourow.coder.tartarus.cloud',
      ],
    },
    ssr: {
      // This marks the `path-to-regexp` package as external, so it won't be bundled in the server build
      // Necessary for how we render Ionic within Astro
      noExternal: ['path-to-regexp'],
    },
  },
});
