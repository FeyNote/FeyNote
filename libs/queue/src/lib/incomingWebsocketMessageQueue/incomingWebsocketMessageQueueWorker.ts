import * as Sentry from '@sentry/node';
import { Worker } from 'bullmq';
import { IncomingWebsocketMessageQueueItem } from './IncomingWebsocketMessageQueueItem';
import { INCOMING_WEBSOCKET_MESSAGE_QUEUE_NAME } from './INCOMING_WEBSOCKET_MESSAGE_QUEUE_NAME';
import { globalServerConfig } from '@feynote/config';

export const incomingWebsocketMessageQueueWorker = new Worker<
  IncomingWebsocketMessageQueueItem,
  void
>(
  INCOMING_WEBSOCKET_MESSAGE_QUEUE_NAME,
  async (args) => {
    try {
      console.log(`Processing job ${args.id}`);
    } catch (e) {
      console.log(`Failed processing job ${args.id}`, e);

      Sentry.captureException(e);

      throw e;
    }

    console.log(`Finished processing job ${args.id}`);
  },
  {
    autorun: false,
    connection: {
      host: globalServerConfig.worker.redis.host,
      port: globalServerConfig.worker.redis.port,
    },
    removeOnComplete: { count: globalServerConfig.worker.queueCompleteCount },
    removeOnFail: { count: globalServerConfig.worker.queueFailCount },
    concurrency: globalServerConfig.worker.queueConcurrency,
  },
);
