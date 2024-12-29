import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

import { globalServerConfig } from '@feynote/config';

Sentry.init({
  dsn: globalServerConfig.sentry.websocket.dsn,
  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: globalServerConfig.sentry.websocket.samplingRate,
  environment: process.env.NODE_ENV,
  beforeSend(event, hint) {
    // Sentry trace sampling does not corrrectly filter at 0% sample rate
    if (globalServerConfig.sentry.websocket.samplingRate === 0) return null;

    return event;
  },
});
