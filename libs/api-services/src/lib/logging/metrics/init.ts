import express from 'express';
import client from 'prom-client';
import { logger } from '../logger';

export const initPromClient = () => {
  client.collectDefaultMetrics();
};

export const setupMinimalMetricsServer = (
  opts:
    | {
        port: number;
        existingApp?: undefined;
      }
    | {
        port?: undefined;
        existingApp: ReturnType<typeof express>;
      },
) => {
  let app = opts.existingApp;
  if (!app) {
    app = express();
  }

  initPromClient();

  app.get('/metrics', async (_, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  });

  if (!opts.existingApp) {
    const server = app.listen(opts.port, () => {
      logger.info(`Metrics available at http://0.0.0.0:${opts.port}/metrics`);
    });
    server.on('error', logger.error);

    const shutdown = async () => {
      server.close();
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  }
};
