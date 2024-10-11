import { Queue } from 'bullmq';
import { INCOMING_WEBSOCKET_MESSAGE_QUEUE_NAME } from './INCOMING_WEBSOCKET_MESSAGE_QUEUE_NAME';
import { IncomingWebsocketMessageQueueItem } from './IncomingWebsocketMessageQueueItem';
import { globalServerConfig } from '@feynote/config';

export const incomingWebsocketMessageQueue = new Queue<
  IncomingWebsocketMessageQueueItem,
  void
>(INCOMING_WEBSOCKET_MESSAGE_QUEUE_NAME, {
  connection: {
    host: globalServerConfig.worker.redis.host,
    port: globalServerConfig.worker.redis.port,
  },
});

export const enqueueIncomingWebsocketMessage = (
  item: IncomingWebsocketMessageQueueItem,
) => {
  return incomingWebsocketMessageQueue.add(
    `${Date.now()}-${Math.random()}`,
    item,
  );
};
