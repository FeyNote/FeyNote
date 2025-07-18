import './instrument.ts';

import * as Sentry from '@sentry/node';
import express from 'express';
import morgan from 'morgan';
import * as trpcExpress from '@trpc/server/adapters/express';
import { getHTTPStatusCodeFromError } from '@trpc/server/http';
import { TRPCError } from '@trpc/server';

import { hocuspocusServer } from './hocuspocus';
import { globalServerConfig } from '@feynote/config';
import {
  logger,
  metrics,
  setupMinimalMetricsServer,
  createContextWithHocuspocus,
  hocuspocusTrpcAppRouter,
} from '@feynote/api-services';

/**
 * This initializes Hocuspocus, what we actually care about in this server.
 * This is the main show -- manages documents, etc.
 */
hocuspocusServer.listen();

/**
 * This provides a sidecar express server for a few purposes:
 * 1. To serve metrics about Hocuspocus to prometheus
 * 2. To provide server:server methods that our API can use to interact with in-memory documents
 */
const app = express();

app.use(function (req, res, next) {
  const timer = metrics.apiRequest.startTimer();
  res.on('finish', function () {
    const time = timer();
    metrics.hocuspocusApiRequest.observe(
      {
        status_code: res.statusCode,
        method: req.method,
        path: req.route?.path || req.path,
      },
      time,
    );
  });

  next();
});

app.use(
  morgan(':status :method :url :response-time ms', {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
  }),
);

setupMinimalMetricsServer({
  existingApp: app,
});

app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: hocuspocusTrpcAppRouter,
    createContext: createContextWithHocuspocus(hocuspocusServer),
    onError: (opts) => {
      const { error, type, path, input, ctx, req } = opts;

      const statusCode = getHTTPStatusCodeFromError(error);
      if (statusCode >= 500) {
        logger.error(error.stack);

        const mainError =
          error instanceof TRPCError ? error.cause || error : error;

        Sentry.captureException(mainError, {
          extra: {
            statusCode,
            error,
            type,
            path,
            input,
            ctx,
            req,
          },
        });
      }
    },
  }),
);

const server = app.listen(globalServerConfig.hocuspocus.restPort, () => {
  logger.info(
    `Hocuspocus metrics+trpc server listening at http://0.0.0.0:${globalServerConfig.hocuspocus.restPort}/`,
  );
});
server.on('error', logger.error);

const shutdown = () => {
  server.close((e) => {
    logger.error(e);

    process.exit(e ? 1 : 0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
