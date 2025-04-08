import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

import { globalServerConfig } from '@feynote/config';
import { TRPC_ERROR_CODES_BY_KEY } from '@trpc/server/rpc';

// We do not want to log expected errors from tRPC to Sentry
const trpcFilteredErrorNames = new Set(Object.keys(TRPC_ERROR_CODES_BY_KEY));
trpcFilteredErrorNames.delete('INTERNAL_SERVER_ERROR');

Sentry.init({
  dsn: globalServerConfig.sentry.api.dsn,
  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: globalServerConfig.sentry.api.samplingRate,
  environment: process.env.NODE_ENV,
  beforeSend(event, hint) {
    // Sentry trace sampling does not corrrectly filter at 0% sample rate
    if (globalServerConfig.sentry.api.samplingRate === 0) return null;

    const error = hint.originalException;
    if (
      error instanceof Error &&
      error.message &&
      trpcFilteredErrorNames.has(error.message)
    ) {
      return null;
    }

    return event;
  },
  initialScope: {
    extra: {
      source: 'api',
    },
  },
});
