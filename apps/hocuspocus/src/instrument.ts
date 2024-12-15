import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

import { globalServerConfig } from '@feynote/config';

Sentry.init({
  dsn: globalServerConfig.sentry.hocuspocus.dsn,
  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: globalServerConfig.sentry.hocuspocus.samplingRate,
  environment: process.env.NODE_ENV,
});
