import './instrument.ts';

import * as Sentry from '@sentry/node';
import express from 'express';
import morgan from 'morgan';
import * as trpcExpress from '@trpc/server/adapters/express';
import cors from 'cors';

import { appRouter, createContext } from '@feynote/trpc';
import { fileRouter } from './routes/file/index';
import { messageRouter } from './routes/message';
import { stripeRouter } from './routes/stripe/index.js';
import {
  logger,
  metrics,
  setupMinimalMetricsServer,
} from '@feynote/api-services';
import { globalServerConfig } from '@feynote/config';
import { getHTTPStatusCodeFromError } from '@trpc/server/http';
import { TRPCError } from '@trpc/server';

const app = express();

const defaultCorsAllowlist = [
  'https://feynote.com',
  'https://app.feynote.com',
  'https://beta.feynote.com',
  'https://app.beta.feynote.com',
  'https://staging.feynote.com',
  'https://app.staging.feynote.com',
];

const hostMatch = (pattern: string, origin: string) => {
  if (pattern.endsWith('*')) {
    return origin.startsWith(pattern.substring(0, pattern.length - 1));
  }

  return origin === pattern;
};

const corsOptions = {
  origin: (origin, callback) => {
    const allowCors =
      origin &&
      defaultCorsAllowlist.some((pattern) => hostMatch(pattern, origin));
    callback(null, allowCors);
  },
} satisfies cors.CorsOptions;

app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

const urlEncodedMiddleware = express.urlencoded({
  extended: true,
});

const jsonMiddleware = express.json({
  limit: '100MB',
  verify: (req, res, buf) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const url = (req as any).originalUrl;
    if (url.startsWith('/stripe/webhook')) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (req as any).rawBody = buf.toString();
    }
  },
});

app.use(function (req, res, next) {
  const timer = metrics.apiRequest.startTimer();
  res.on('finish', function () {
    const time = timer();
    metrics.apiRequest.observe(
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

app.use('/message', urlEncodedMiddleware, jsonMiddleware, messageRouter);
app.use('/file', urlEncodedMiddleware, jsonMiddleware, fileRouter);
app.use('/stripe', urlEncodedMiddleware, jsonMiddleware, stripeRouter);

app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
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

const server = app.listen(globalServerConfig.api.port, () => {
  logger.info(`Listening at http://0.0.0.0:${globalServerConfig.api.port}/api`);
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
