import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

import { globalServerConfig } from '@feynote/config';

Sentry.init({
  dsn: globalServerConfig.sentry.api.dsn,
  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: globalServerConfig.sentry.api.samplingRate,
  environment: process.env.NODE_ENV,
});
