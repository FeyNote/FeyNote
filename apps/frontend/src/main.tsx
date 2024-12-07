/* eslint-disable import/first */

import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'https://c33be4806db6ac96de06c5de2f8ebc85@o4508428193955840.ingest.us.sentry.io/4508428202606592',
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1.0, //  Percentage of transactions to capture. 1.0 captures 100%
  // Controls which URLs distributed tracing should be enabled
  tracePropagationTargets: [
    'localhost',
    /^https:\/\/feynote\.com\/api/,
    /^https:\/\/app\.feynote\.com\/api/,
  ],
  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

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
