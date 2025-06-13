import winston from 'winston';
import * as Sentry from '@sentry/node';
import Transport from 'winston-transport';
import { globalServerConfig } from '@feynote/config';

const SentryWinstonTransport = Sentry.createSentryWinstonTransport(Transport);

const transports: Transport[] = [];

if (globalServerConfig.logger.transports.console) {
  transports.push(
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  );
}

if (globalServerConfig.logger.transports.sentry) {
  transports.push(new SentryWinstonTransport());
}

if (!transports.length) {
  console.error('WARNING: No Winston transports have been enabled');
}

export const logger = winston.createLogger({
  level: globalServerConfig.logger.level,
  transports,
});
