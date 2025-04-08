import { sentryVitePlugin } from '@sentry/vite-plugin';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  root: __dirname,
  build: {
    outDir: '../../dist/apps/frontend',
    reportCompressedSize: true,

    commonjsOptions: {
      transformMixedEsModules: true,
    },

    sourcemap: process.env.SOURCEMAP_UPLOAD === 'true', // We only want to take the extra time to build sourcemaps if we're shipping a version
  },
  cacheDir: '../../node_modules/.vite/frontend',

  server: {
    port: 4200,
    host: '0.0.0.0',
    allowedHosts: true,
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
        type: 'module',
      },
      injectManifest: {
        maximumFileSizeToCacheInBytes: 4194304, // 2097152 is the default, increased here since our bundle size has grown over the limit
        globIgnores: ['**\\/node_modules\\/**\\/*', 'index.html'],
        buildPlugins: {
          vite: [nxViteTsPaths()],
        },
      },
      manifest: {
        id: 'com.feynote.app',
        name: 'FeyNote - Tabletop Note Keeper',
        short_name: 'FeyNote',
        description:
          'A place to store your notes for your favorite tabletop game',
        theme_color: '#ffffff',
        launch_handler: {
          client_mode: 'navigate-existing',
        },
        orientation: 'any',
        screenshots: [],
        handle_links: 'preferred',
        categories: ['games', 'role-playing', 'note-taking'],
        icons: [
          {
            src: 'https://static.feynote.com/icons/feynote-icon-padded-512x512-20241220.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'https://static.feynote.com/icons/generated/pwabuilder-20241220/android/android-launchericon-512-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
    sentryVitePlugin({
      org: 'redchickenco',
      project: 'feynote-app',
      disable: process.env.SOURCEMAP_UPLOAD !== 'true', // We only want to take the extra time to build sourcemaps if we're shipping a version
      release: {
        name: process.env.VITE_APP_VERSION,
      },
    }),
    ...(process.env.ENABLE_BUNDLE_ANALYZER === 'true'
      ? [
          visualizer({
            emitFile: true,
            filename: 'stats.html',
          }),
        ]
      : []),
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
