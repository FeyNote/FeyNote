/* eslint-disable import/first */

import * as Sentry from '@sentry/react';

let environment = import.meta.env.MODE || import.meta.env.VITE_ENVIRONMENT;
if (environment === 'development') {
  const hostname = window.location.hostname;

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
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    sampleRate: 1, //  Percentage of transactions to capture. 1.0 captures 100%
    // Controls which URLs distributed tracing should be enabled
    tracePropagationTargets: [
      /^https:\/\/feynote\.com\/api/,
      /^https:\/\/app\.feynote\.com\/api/,
    ],
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1,
  });
}

import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './app/App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
