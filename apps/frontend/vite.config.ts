import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  root: __dirname,
  build: {
    outDir: '../../dist/apps/frontend',
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  cacheDir: '../../node_modules/.vite/frontend',

  server: {
    port: 4200,
    host: '0.0.0.0',
    fs: {
      cachedChecks: false,
    },
  },

  preview: {
    port: 4300,
    host: '0.0.0.0',
  },

  plugins: [
    react(),
    nxViteTsPaths(),
    {
      name: 'configure-response-headers',
      configureServer: (server) => {
        server.middlewares.use((_req, res, next) => {
          res.setHeader(
            'Cross-Origin-Opener-Policy',
            'same-origin-allow-popups',
          );
          next();
        });
      },
    },
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      injectRegister: 'inline',
      srcDir: 'src',
      filename: 'service-worker.ts',
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: 'FeyNote - Tabletop Note Keeper',
        short_name: 'FeyNote',
        description:
          'A place to store your notes for your favorite tabletop game',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },

  test: {
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/apps/frontend',
      provider: 'v8',
    },
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
});
