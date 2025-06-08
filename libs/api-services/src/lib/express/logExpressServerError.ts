import { logger } from '../logging/logger';
import { ExpressError } from './expressErrors';
import * as Sentry from '@sentry/node';

export const logExpressServerError = (e: unknown) => {
  let status;
  if (e instanceof ExpressError) {
    status = e.status;
  } else {
    status = 500;
  }

  const isExpectedError = status < 500 || status > 599;
  if (isExpectedError) {
    logger.debug(e);

    return;
  }

  logger.error(e);

  Sentry.captureException(e);
};
