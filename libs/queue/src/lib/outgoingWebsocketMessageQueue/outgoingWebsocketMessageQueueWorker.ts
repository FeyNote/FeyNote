import * as Sentry from '@sentry/node';
import { Worker } from 'bullmq';
import { OutgoingWebsocketMessageQueueItem } from './OutgoingWebsocketMessageQueueItem';
import { OUTGOING_WEBSOCKET_MESSAGE_QUEUE_NAME } from './OUTGOING_WEBSOCKET_MESSAGE_QUEUE_NAME';
import { globalServerConfig } from '@feynote/config';
import { Server } from 'socket.io';
import { logger } from '@feynote/api-services';

export const buildOutgoingWebsocketMessageQueueWorker = (io: Server) => {
  return new Worker<OutgoingWebsocketMessageQueueItem, void>(
    OUTGOING_WEBSOCKET_MESSAGE_QUEUE_NAME,
    async (args) => {
      try {
        logger.info(`Processing job ${args.id}`);

        io.to(args.data.room).emit(args.data.event, JSON.parse(args.data.json));
      } catch (e) {
        logger.error(`Failed processing job ${args.id}`, e);

        Sentry.captureException(e);

        throw e;
      }

      logger.info(`Finished processing job ${args.id}`);
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
};
