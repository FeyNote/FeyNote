import * as Sentry from '@sentry/node';
import { Worker } from 'bullmq';
import { OutgoingWebsocketMessageQueueItem } from './OutgoingWebsocketMessageQueueItem';
import { OUTGOING_WEBSOCKET_MESSAGE_QUEUE_NAME } from './OUTGOING_WEBSOCKET_MESSAGE_QUEUE_NAME';
import { globalServerConfig } from '@feynote/config';
import { Server } from 'socket.io';
import { logger, metrics } from '@feynote/api-services';

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

      metrics.websocketMessageOutgoingProcessed.inc({
        message_type: args.data.event,
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
      removeOnComplete: {
        count: globalServerConfig.websocket.queueCompleteCount,
      },
      removeOnFail: { count: globalServerConfig.websocket.queueFailCount },
      concurrency: globalServerConfig.websocket.queueConcurrency,
    },
  );
};
