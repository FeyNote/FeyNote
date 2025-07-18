import * as Sentry from '@sentry/node';
import { Worker } from 'bullmq';
import { IncomingWebsocketMessageQueueItem } from './IncomingWebsocketMessageQueueItem';
import { INCOMING_WEBSOCKET_MESSAGE_QUEUE_NAME } from './INCOMING_WEBSOCKET_MESSAGE_QUEUE_NAME';
import { globalServerConfig } from '@feynote/config';
import { logger, metrics } from '@feynote/api-services';

export const incomingWebsocketMessageQueueWorker = new Worker<
  IncomingWebsocketMessageQueueItem,
  void
>(
  INCOMING_WEBSOCKET_MESSAGE_QUEUE_NAME,
  async (args) => {
    try {
      logger.info(`Processing job ${args.id}`);
    } catch (e) {
      logger.error(`Failed processing job ${args.id}`, e);

      Sentry.captureException(e);

      throw e;
    }

    metrics.websocketMessageIncomingProcessed.inc({
      message_type: 'unknown', // TODO: Once we have incoming message types and a structure for this, add message_type accordingly
    });

    logger.info(`Finished processing job ${args.id}`);
  },
  {
    autorun: false,
    connection: {
      host: globalServerConfig.websocket.redis.host,
      port: globalServerConfig.websocket.redis.port,
    },
    prefix: globalServerConfig.websocket.redis.keyPrefix,
    removeOnComplete: { count: globalServerConfig.worker.queueCompleteCount },
    removeOnFail: { count: globalServerConfig.worker.queueFailCount },
    concurrency: globalServerConfig.worker.queueConcurrency,
  },
);
