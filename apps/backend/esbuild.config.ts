const { sentryEsbuildPlugin } = require('@sentry/esbuild-plugin');

require('esbuild').build({
  sourcemap: process.env.SOURCEMAP_UPLOAD === 'true', // Source map generation must be turned on for Sentry
  external: ['@sentry/profiling-node'],
  bundle: true,
  plugins: [
    // Put the Sentry esbuild plugin after all other plugins
    sentryEsbuildPlugin({
      disable: process.env.SOURCEMAP_UPLOAD !== 'true',
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: 'redchickenco',
      project: 'feynote-api',
    }),
  ],
});
