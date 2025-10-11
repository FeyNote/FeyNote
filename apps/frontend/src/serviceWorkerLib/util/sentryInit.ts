/* eslint-disable no-restricted-globals */

import * as Sentry from '@sentry/browser';

let environment = import.meta.env.MODE || import.meta.env.VITE_ENVIRONMENT;
if (environment !== 'development') {
  const hostname = self.location.hostname;

  if (environment === 'production' && hostname.includes('.beta.')) {
    // We don't do separate builds for beta/production, so hostname check is the best
    // approach
    environment = 'beta';
  }

  Sentry.init({
    release: import.meta.env.VITE_APP_VERSION,
    environment,
    dsn: 'https://c33be4806db6ac96de06c5de2f8ebc85@o4508428193955840.ingest.us.sentry.io/4508428202606592',
    transport: Sentry.makeBrowserOfflineTransport(Sentry.makeFetchTransport),

    tracesSampleRate: 1,

    initialScope: {
      extra: {
        source: 'serviceworker',
      },
    },
  });
}
